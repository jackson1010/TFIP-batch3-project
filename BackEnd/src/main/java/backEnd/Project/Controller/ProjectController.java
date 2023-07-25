package backEnd.Project.Controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.core.JsonProcessingException;

import backEnd.Project.Model.AccountFund;
import backEnd.Project.Model.Brand;
import backEnd.Project.Model.GraphDetails;
import backEnd.Project.Model.Stock;
import backEnd.Project.Model.myStock;
import backEnd.Project.Services.EmailServices;
import backEnd.Project.Services.ProjectServices;

@Controller
@RequestMapping("/api")
public class ProjectController {

    @Autowired
    private ProjectServices projectServices;

    @Autowired
    private EmailServices emailServices;

    @PostMapping(path = "changePassword", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> result)
            throws JsonProcessingException {
        Map<String, String> responseMap = new HashMap<>();
        String oldPassword = result.get("oldPassword");
        String newPassword = result.get("password");
        String email = result.get("email");

        try {
            projectServices.changePassword(oldPassword, newPassword, email);
            responseMap.put("detail", "Password Updated");
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (IOException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "stock/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> getStockPrice(@PathVariable String symbol)
            throws JsonProcessingException {
        Map<String, String> responseMap = new HashMap<>();

        try {
            String price = projectServices.getStockPrice(symbol);
            responseMap.put("price", price);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "myStock/{user_id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getMyStock(@PathVariable String user_id)
            throws JsonProcessingException {
        Map<String, Object> responseMap = new HashMap<>();
        List<myStock> stockList = new LinkedList<>();
        try {
            stockList = projectServices.getStockList(user_id);
            responseMap.put("stock", stockList);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "yahooStock/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getNewStock(@PathVariable String symbol)
            throws JsonProcessingException {
        Map<String, Object> responseMap = new HashMap<>();
        List<Stock> stock = new LinkedList<>();
        try {
            stock = projectServices.getNewStock(symbol);
            responseMap.put("stock", stock);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "icon/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getIcon(@PathVariable String name) throws JsonProcessingException {
        Map<String, Object> responseMap = new HashMap<>();
        try {
            Brand result = projectServices.getIcon(name);
            responseMap.put("icon", result.getIcon());
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "yahooGraph/{symbol}/{timing}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getNewGraph(@PathVariable String symbol, @PathVariable String timing)
            throws JsonProcessingException {
        Map<String, Object> responseMap = new HashMap<>();
        try {
            GraphDetails result = projectServices.getGraph(symbol, timing);
            responseMap.put("stock", result);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "yahooActiveStock", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getActiveStock()
            throws JsonProcessingException {
        Map<String, Object> responseMap = new HashMap<>();
        List<Stock> quotes = new LinkedList<>();
        try {
            quotes = projectServices.getActiveStock();
            responseMap.put("stock", quotes);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "getAccountFunds/{user_id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAccountFunds(@PathVariable String user_id)
            throws JsonProcessingException {
        Map<String, Object> responseMap = new HashMap<>();

        try {
            List<AccountFund> funds = projectServices.SQLfindAccountFunds(user_id);
            responseMap.put("assets", funds);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @PostMapping(path = "withdraw", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> withdraw(@RequestBody Map<String, String> result)
            throws JsonProcessingException {
        Map<String, String> responseMap = new HashMap<>();
        String account = result.get("account");
        String address = result.get("address");
        Double amount = Double.parseDouble(result.get("amount")) * -1;
        String bankName = result.get("bankName");
        String code = result.get("code");
        String country = result.get("country");
        String name = result.get("name");
        String user_id = result.get("user_id");
        String email = result.get("email");

        UUID uuid = UUID.randomUUID();
        String uuidString = uuid.toString();
        String transaction_id = uuidString.substring(0, 8);

        try {
            projectServices.withdraw(user_id, transaction_id, amount, "usd", bankName, account);
            emailServices.sendFundsEmailWithDraw(email, amount, bankName, account);
            responseMap.put("transaction_id", transaction_id);
            responseMap.put("status", "success");
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (Exception e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @PostMapping(path = "orderStock", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> orderStock(@RequestBody Map<String, String> result)
            throws JsonProcessingException {
        Map<String, String> responseMap = new HashMap<>();
        String buyOrSell = result.get("buyOrSell");
        String orderType = result.get("orderType");
        Double price = Double.parseDouble(result.get("price"));
        Double quantity = Double.parseDouble(result.get("quantity"));
        Double amount = Double.parseDouble(result.get("amount"));
        String user_id = result.get("user_id");
        String symbol = result.get("symbol");
        String longName = result.get("longName");


        try {
            projectServices.orderStock(user_id, symbol, longName, buyOrSell, orderType, price, quantity, amount);
            responseMap.put("status", "success");
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (Exception e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @PostMapping(path = "insertPendingOrder", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> insertPendingOrder(@RequestBody Map<String, String> result)
            throws JsonProcessingException {
        Map<String, String> responseMap = new HashMap<>();
        String buyOrSell = result.get("buyOrSell");
        String orderType = result.get("orderType");
        Double price = Double.parseDouble(result.get("price"));
        Double quantity = Double.parseDouble(result.get("quantity"));
        Double amount = Double.parseDouble(result.get("amount"));
        String user_id = result.get("user_id");
        String symbol = result.get("symbol");
        String name = result.get("longName");
        String status = result.get("status");


        try {
            projectServices.insertPendingOrder(user_id, buyOrSell, symbol, name, orderType, price, quantity, amount,
                    status);
            responseMap.put("status", "Order submitted");
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (Exception e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @GetMapping(path = "getPendingOrders/{user_id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getPendingOrders(@PathVariable String user_id) {
        Map<String, Object> responseMap = new HashMap<>();
        List<myStock> pendingOrders = new LinkedList<>();

        try {
            pendingOrders = projectServices.getPendingOrders(user_id);
            responseMap.put("stock", pendingOrders);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (RestClientException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @PostMapping(path = "deletePendingOrders", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> deletePendingOrders(@RequestBody Map<String, String> result)
            throws JsonProcessingException {
        Map<String, String> responseMap = new HashMap<>();
        String buyOrSell = result.get("buyOrSell");
        String orderType = result.get("orderType");
        Double price = Double.parseDouble(result.get("price"));
        Double quantity = Double.parseDouble(result.get("quantity"));
        Double amount = Double.parseDouble(result.get("amount"));
        String user_id = result.get("user_id");
        String symbol = result.get("symbol");
        String name = result.get("longName");
        String status = result.get("status");

        try {
            projectServices.deletePendingOrders(user_id, buyOrSell, symbol, orderType, price, quantity);
            responseMap.put("status", "pending Order deleted");
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (Exception e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

}
