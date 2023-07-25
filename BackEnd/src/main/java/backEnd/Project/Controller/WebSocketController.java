package backEnd.Project.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import backEnd.Project.Model.Stock;
import backEnd.Project.Model.UserSocketData;
import backEnd.Project.Services.ProjectServices;

@Controller
public class WebSocketController {

    @Autowired
    private ProjectServices projectServices;

    @Autowired
    private SimpMessagingTemplate template;

    private Map<String, UserSocketData> userStates = new HashMap<>();

    // dont need to add api as websocket config added
    @MessageMapping("/yahooStock/{user_id}/{symbol}/{timing}")
    public void getNewStock(@DestinationVariable String user_id,
            @DestinationVariable String symbol,
            @DestinationVariable String timing) throws Exception {


        UserSocketData user = userStates.getOrDefault(user_id, new UserSocketData());
        user.setUser_id(user_id);
        user.setSymbol(symbol);
        user.setTimingForStock(timing);
        user.setStartSendingStock(true);
        userStates.put(user_id, user);
        sendGraphAndStockData(user_id, symbol, timing);
    }

    @MessageMapping("/yahooStockPending/{user_id}/{pendingString}/{timing}")
    public void getPendingOrders(@DestinationVariable String user_id,
            @DestinationVariable String pendingString,
            @DestinationVariable String timing)
            throws Exception {
        // Call your service to get the stock data

        UserSocketData user = userStates.getOrDefault(user_id, new UserSocketData());

        user.setUser_id(user_id);
        user.setSymbol(pendingString);
        user.setTimingForPendingOrder(timing);
        user.setStartSendingPendingOrder(true);
        userStates.put(user_id, user);
        sendPendingOrdersData(user_id, pendingString);
    }

    // for pending Orders
    @Scheduled(fixedRate = 180000) // 3 min
    public void SendPendingOrders() throws Exception {
        // sendPendingOrdersData(pendingString);
        for (Map.Entry<String, UserSocketData> entry : userStates.entrySet()) {
            UserSocketData user = entry.getValue();
            if (user.getStartSendingPendingOrder() && user.getTimingForPendingOrder().equals("3m")) {
              
                sendPendingOrdersData(user.getUser_id(), user.getSymbol());
            }
        }

    }

    @Scheduled(fixedRate = 180000) // 3 min
    public void sendStockUpdatesEveryMin() throws Exception {
        // sendOnlyStockData();
        for (Map.Entry<String, UserSocketData> entry : userStates.entrySet()) {
            UserSocketData user = entry.getValue();
            if (user.getStartSendingStock() && user.getTimingForStock().equals("5m")) {

                sendOnlyStockData(user.getUser_id(), user.getSymbol(), user.getTimingForStock());
            }
        }
    }

    @Scheduled(fixedRate = 300000) // 5 minutes
    public void sendStockUpdatesEvery5Mins() throws Exception {
        // sendGraphData();
        for (Map.Entry<String, UserSocketData> entry : userStates.entrySet()) {
            UserSocketData user = entry.getValue();
            if (user.getStartSendingStock() && user.getTimingForStock().equals("5m")) {
                sendGraphAndStockData(user.getUser_id(), user.getSymbol(), user.getTimingForStock());
            }
        }
    }

    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void sendStockUpdatesEvery30Mins() throws Exception {
        // sendGraphData();
        for (Map.Entry<String, UserSocketData> entry : userStates.entrySet()) {
            UserSocketData user = entry.getValue();
            if (user.getStartSendingStock() && user.getTimingForStock().equals("30m")) {
                sendGraphAndStockData(user.getUser_id(), user.getSymbol(), user.getTimingForStock());
            }
        }
    }

    @Scheduled(fixedRate = 3600000) // 1h
    public void sendStockUpdatesEvery60Mins() throws Exception {
        // sendGraphData();
        for (Map.Entry<String, UserSocketData> entry : userStates.entrySet()) {
            UserSocketData user = entry.getValue();
            if (user.getStartSendingStock() && user.getTimingForStock().equals("1h")) {
                sendGraphAndStockData(user.getUser_id(), user.getSymbol(), user.getTimingForStock());
            }
        }
    }

    private void sendGraphAndStockData(String user_id, String symbol, String timing) throws Exception {
        List<Stock> stockList = projectServices.getNewStock(symbol);
        Stock stock = stockList.get(0);
        stock.setGraphDetails(projectServices.getGraph(symbol, timing));
        template.convertAndSend("/topic/stocks/" + user_id, stock);
    }

    private void sendOnlyStockData(String user_id, String symbol, String timing) throws Exception {

        List<Stock> stockList = projectServices.getNewStock(symbol);
        Stock stock = stockList.get(0);
;
        template.convertAndSend("/topic/stocks/" + user_id, stock);
    }

    private void sendPendingOrdersData(String user_id, String pendingString) throws Exception {
        List<Stock> stockList = projectServices.getNewStock(pendingString);
        template.convertAndSend("/topic/pendingOrders/" + user_id, stockList);
    }

    @MessageMapping("/stopUpdates/{user_id}")
    public void stopUpdates(@DestinationVariable String user_id) {
        UserSocketData user = userStates.get(user_id);
        if (user != null && user.getStartSendingStock()) {
            user.setStartSendingStock(false);
        }
    }

    @MessageMapping("/stopPendingOrders/{user_id}")
    public void stopPendingOrders(@DestinationVariable String user_id) {
        UserSocketData user = userStates.get(user_id);
        if (user != null && user.getStartSendingPendingOrder()) {
            user.setStartSendingPendingOrder(false);
        }
    }
}
