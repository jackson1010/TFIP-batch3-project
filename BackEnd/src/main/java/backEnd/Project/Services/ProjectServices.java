package backEnd.Project.Services;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;

import backEnd.Project.Model.AccountFund;
import backEnd.Project.Model.Brand;
import backEnd.Project.Model.GraphDetails;
import backEnd.Project.Model.Stock;
import backEnd.Project.Model.StockList;
import backEnd.Project.Model.User;
import backEnd.Project.Model.myStock;
import backEnd.Project.Repo.ProjectRepo;
import backEnd.Project.response.MessageResponse;

@Service
public class ProjectServices {

    @Autowired
    private ProjectRepo projectRepo;

    @Value("${spring.data.google.client.id}")
    private String googleClientId;

    @Value("${spring.data.rapidapi.key}")
    private String rapidApiKey;

    public User getAuthenticated(String email, String password) throws IOException {
        return projectRepo.getAuthenticated(email, password);
    }

    // new user
    @Transactional(rollbackFor = Exception.class)
    public void createNewUser(User user) throws Exception {

        AccountFund af = new AccountFund();
        af.setTransaction_id(null);
        af.setAmount(20000.00);
        af.setCurrency("usd");
        af.setStatus("signedUp");

        List<AccountFund> afl = new LinkedList<>();
        afl.add(af);
        user.setFunds(afl);

        projectRepo.signupSQL(user);
        projectRepo.createAccountBalance(af.getTransaction_id(), af.getAmount(), af.getCurrency(), af.getStatus(),
                user.getId());

        String tempPassword = projectRepo.signupRedis(user);

    }

    public void changePassword(String oldPassword, String newPassword, String email) throws IOException {
        projectRepo.changePassword(oldPassword, newPassword, email);
    }

    public String getStockPrice(String symbol) throws RestClientException {
        final String URL = "https://twelve-data1.p.rapidapi.com/price";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(URL).queryParam("symbol", symbol);
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", rapidApiKey);
        headers.set("X-RapidAPI-Host", "twelve-data1.p.rapidapi.com");
        HttpEntity<String> entity = new HttpEntity<String>(headers);
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> response = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity,
                String.class);

        return response.getBody();
    }

    public List<myStock> getStockList(String user_id) {
        return projectRepo.getStockList(user_id);
    }

    public List<Stock> getNewStock(String symbol) throws JsonMappingException, JsonProcessingException {
        final String URL = "https://mboum-finance.p.rapidapi.com/qu/quote";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(URL).queryParam("symbol", symbol.toUpperCase());
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", rapidApiKey);
        headers.set("X-RapidAPI-Host", "mboum-finance.p.rapidapi.com");
        HttpEntity<String> entity = new HttpEntity<String>(headers);
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> response = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity,
                String.class);
        ObjectMapper objectMapper = new ObjectMapper();
        List<Stock> stock = objectMapper.readValue(response.getBody(), new TypeReference<List<Stock>>() {
        });
        return stock;
    }

    public Brand getIcon(String name) throws JsonMappingException, JsonProcessingException {
        final String URL = "https://api.brandfetch.io/v2/search" + "/" + name;
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("Referer", "https://example.com/searchIntegrationPage");
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(URL, HttpMethod.GET, entity, String.class);
        ObjectMapper objectMapper = new ObjectMapper();
        Brand[] result = objectMapper.readValue(response.getBody(), Brand[].class);

        String nameToMatch = "\\b" + name + "\\b";
        Brand match = Arrays.stream(result)
                .filter(brand -> brand.getName() != null && Pattern.compile(nameToMatch, Pattern.CASE_INSENSITIVE)
                        .matcher(brand.getName()).find())
                .findFirst()
                .orElse(null);

        return match;
    }

    public GraphDetails getGraph(String symbol, String timing) throws JsonMappingException, JsonProcessingException {
        final String URL = "https://yahoo-finance15.p.rapidapi.com/api/yahoo/hi/history";
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(URL + "/" + symbol.toUpperCase() + "/" + timing);
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", rapidApiKey);
        headers.set("X-RapidAPI-Host", "yahoo-finance15.p.rapidapi.com");
        HttpEntity<String> entity = new HttpEntity<String>(headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity,
                String.class);
        ObjectMapper objectMapper = new ObjectMapper();
        GraphDetails result = objectMapper.readValue(response.getBody(), GraphDetails.class);

        return result;
    }

    public List<Stock> getActiveStock() throws JsonMappingException, JsonProcessingException {
        final String URL = "https://yahoo-finance15.p.rapidapi.com/api/yahoo/co/collections/most_actives";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(URL);
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", rapidApiKey);
        headers.set("X-RapidAPI-Host", "yahoo-finance15.p.rapidapi.com");
        HttpEntity<String> entity = new HttpEntity<String>(headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity,
                String.class);

        ObjectMapper objectMapper = new ObjectMapper();

        StockList stocks = objectMapper.readValue(response.getBody(), StockList.class);
        List<Stock> stock = stocks.getQuotes();
        return stock.stream().limit(5).collect(Collectors.toList());
    }

    public void createAccountBalance(String id, double amount, String currency, String accountId) throws Exception {
        projectRepo.createAccountBalance(id, amount, currency, "pending", accountId);
    }

    public String updateAccountBalance(String transaction_id, double amount, String currency, String status,
            Long datetime) {
        return projectRepo.updateAccountBalance(transaction_id, amount, currency, status, datetime);
    }

    public List<AccountFund> SQLfindAccountFunds(String user_id) {
        return projectRepo.SQLfindAccountFunds(user_id);
    }

    public void withdraw(String user_id, String transaction_id, Double amount, String currency, String bankName,
            String account) throws Exception {
        projectRepo.SQLWithdraw(user_id, transaction_id, amount, currency, bankName + account);
    }

    public void orderStock(String user_id, String symbol, String longName, String buyOrSell, String orderType,
            Double price, Double quantity, Double amount) throws Exception {

        projectRepo.orderStock(user_id, symbol, longName, buyOrSell, orderType, price, quantity, amount);
    }

    public void insertPendingOrder(String user_id, String buyOrSell, String symbol, String name, String orderType,
            Double price, Double quantity, Double amount, String status) throws Exception {
        projectRepo.insertPendingOrder(user_id, buyOrSell, symbol, name, orderType,
                price, quantity, amount, status);
    }

    public List<myStock> getPendingOrders(String user_id) {
        return projectRepo.getPendingOrders(user_id);
    }

    public void deletePendingOrders(String user_id, String buyOrSell, String symbol, String orderType,
            Double price, Double quantity) {
        projectRepo.deletePendingOrders(user_id, buyOrSell, symbol, orderType,
                price, quantity);
    }

}
