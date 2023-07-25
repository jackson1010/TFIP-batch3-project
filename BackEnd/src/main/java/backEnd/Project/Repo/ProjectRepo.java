package backEnd.Project.Repo;

import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import backEnd.Project.Model.AccountFund;
import backEnd.Project.Model.User;
import backEnd.Project.Model.myStock;

@Repository
public class ProjectRepo {

    @Autowired
    RedisTemplate<String, String> template;

    @Autowired
    private JdbcTemplate SQLtemplate;

    public User findByEmail(String email) throws JsonMappingException, JsonProcessingException {
        String result = template.opsForValue().get(email);
        ObjectMapper mapper = new ObjectMapper();
        if (result != null) {
            User user = mapper.readValue(result, User.class);
            return user;
        }
        return null;
    }

    public User getAuthenticated(String email, String password) throws IOException {

        // SQL to get id lol
        User sqlUser = SQLfindUserByEmail(email);
        User user = new User();

        if (password != null) {
            String result = template.opsForValue().get(email);
            ObjectMapper mapper = new ObjectMapper();
            user = mapper.readValue(result, User.class);
            if (result == null) {
                throw new IOException("User not found");
            }
        }

        user.setId(sqlUser.getId());
        if (password != null) {
            String datapassword = user.getPassword();
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if (!passwordEncoder.matches(password, datapassword)) {
                throw new IOException("Incorrect Username or Password");
            }
        }

        // Retrieve accounts funds
        List<AccountFund> funds = SQLfindAccountFunds(user.getId());
        for (AccountFund af : funds) {
        }
        user.setFunds(funds);

        return user;
    }

    public void changePassword(String oldPassword, String newPassword, String email) throws IOException {
        String result = template.opsForValue().get(email);
        ObjectMapper mapper = new ObjectMapper();
        User user = mapper.readValue(result, User.class);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IOException("Current Password is incorrect");
        } else {
            String hashedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(hashedPassword);
            template.opsForValue().set(user.getEmail(), User.toJSON(user).toString());
        }
    }

    public String signupRedis(User user) throws IOException {
        String result = template.opsForValue().get(user.getEmail());
        if (result != null) {
            throw new IOException("Existing email");
        }

        if (user.getPassword() == null) {
            String newPassword = User.createID();
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String hashedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(hashedPassword);
            template.opsForValue().set(user.getEmail(), User.toJSON(user).toString());
            return newPassword;
        } else {
            template.opsForValue().set(user.getEmail(), User.toJSON(user).toString());
            return null;
        }

    }

    public void signupSQL(User user) throws Exception {
        SQLtemplate.update(SQLQueries.INSERT_USER, user.getId(), user.getEmail(), "demo");
    }

    public User SQLfindUserByEmail(String email) {
        User user = new User();
        SqlRowSet rs = SQLtemplate.queryForRowSet(SQLQueries.GET_USER_BY_EMAIL, email);
        while (rs.next()) {
            user.setId(rs.getString("user_id"));
        }
        return user;
    }

    public List<AccountFund> SQLfindAccountFunds(String userId) {
        List<AccountFund> funds = new LinkedList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a", Locale.ENGLISH);
        SqlRowSet rs = SQLtemplate.queryForRowSet(SQLQueries.GET_ACCOUNT_FUNDS_BY_USER_ID, userId);

        while (rs.next()) {
            AccountFund af = new AccountFund();
            af.setTransaction_id(rs.getString("transaction_id"));
            af.setAmount(rs.getDouble("amount"));
            af.setCurrency(rs.getString("currency"));
            af.setStatus(rs.getString("status"));
            long datetimeLong = rs.getLong("datetime") * 1000;
            Date datetime = new Date(datetimeLong);
            String formattedDate = datetime.toInstant().atZone(ZoneId.systemDefault()).format(formatter);
            af.setDatetime(formattedDate);
            funds.add(af);
        }
        return funds;
    }

    public List<myStock> getStockList(String user_id) {
        List<myStock> resultList = new LinkedList<>();
        SqlRowSet rs = SQLtemplate.queryForRowSet(SQLQueries.GET_STOCKS_BY_ID, user_id);
        while (rs.next()) {
            myStock result = new myStock();
            result.setBuyOrSell(rs.getString("buyOrSell"));
            result.setSymbol(rs.getString("symbol"));
            result.setName(rs.getString("name"));
            result.setOrderType(rs.getString("orderType"));
            result.setPrice(rs.getDouble("price"));
            result.setQuantity(rs.getDouble("quantity"));
            result.setAmount(rs.getDouble("amount"));

            resultList.add(result);
        }
        return resultList;
    }

    public void createAccountBalance(String transaction_id, double amount, String currency, String status,
            String user_id) throws Exception {
        SQLtemplate.update(SQLQueries.INSERT_ACCOUNT_FUNDS_BY_USER_ID, user_id, transaction_id, amount, currency,
                status,
                null, (System.currentTimeMillis() / 1000L));
    }

    public String updateAccountBalance(String transaction_id, double amount, String currency, String status,
            Long datetime) {
        SqlRowSet rs = SQLtemplate.queryForRowSet(SQLQueries.GET_USER_ID_EMAIL, transaction_id);
        String user_id = null;
        String email = null;
        if (rs.next()) {
            user_id = rs.getString("user_id");
            email = rs.getString("email");
        }
        System.out.println(user_id + " " + email);
        SQLtemplate.update(SQLQueries.INSERT_ACCOUNT_FUNDS_BY_USER_ID, user_id, transaction_id, amount, currency,
                status, null, datetime);
        return email;
    }

    public void SQLWithdraw(String user_id, String transaction_id, double amount, String currency, String bankDetails)
            throws Exception {
        SQLtemplate.update(SQLQueries.INSERT_ACCOUNT_FUNDS_BY_USER_ID, user_id, transaction_id, amount, currency,
                "succeeded", bankDetails, (System.currentTimeMillis() / 1000L));
    }

    public void orderStock(String user_id, String symbol, String longName, String buyOrSell, String orderType,
            Double price, Double quantity, Double amount) throws Exception {
        SQLtemplate.update(SQLQueries.INSERT_STOCK_ORDERS_BY_USER_ID, user_id, buyOrSell, symbol, longName, orderType,
                price, quantity, amount);
    }

    public void insertPendingOrder(String user_id, String buyOrSell, String symbol, String name, String orderType,
            Double price, Double quantity, Double amount, String status) {
        SQLtemplate.update(SQLQueries.INSERT_PENDING_ORDERS_BY_USER_ID, user_id, buyOrSell, symbol, name, orderType,
                price, quantity, amount, status);
    }

    public List<myStock> getPendingOrders(String user_id) {
        List<myStock> resultList = new LinkedList<>();
        SqlRowSet rs = SQLtemplate.queryForRowSet(SQLQueries.GET_PENDING_ORDERS_BY_USER_ID, user_id);
        while (rs.next()) {
            myStock result = new myStock();
            result.setBuyOrSell(rs.getString("buyOrSell"));
            result.setSymbol(rs.getString("symbol"));
            result.setName(rs.getString("name"));
            result.setOrderType(rs.getString("orderType"));
            result.setPrice(rs.getDouble("price"));
            result.setQuantity(rs.getDouble("quantity"));
            result.setAmount(rs.getDouble("amount"));

            resultList.add(result);
        }
        return resultList;
    }

    public void deletePendingOrders(String user_id, String buyOrSell, String symbol, String orderType, Double price,
            Double quantity) {
        SQLtemplate.update(SQLQueries.DELETE_PENDING_ORDERS, user_id, buyOrSell, symbol, orderType,
                price, quantity);
    }

}
