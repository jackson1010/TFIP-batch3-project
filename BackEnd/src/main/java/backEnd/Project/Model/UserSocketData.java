package backEnd.Project.Model;

public class UserSocketData {
    private String user_id;
    private String symbol;
    private Boolean startSendingStock = false;
    private Boolean startSendingPendingOrder = false;
    private String timingForStock;
    private String timingForPendingOrder;

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Boolean getStartSendingStock() {
        return startSendingStock;
    }

    public void setStartSendingStock(Boolean startSendingStock) {
        this.startSendingStock = startSendingStock;
    }

    public Boolean getStartSendingPendingOrder() {
        return startSendingPendingOrder;
    }

    public void setStartSendingPendingOrder(Boolean startSendingPendingOrder) {
        this.startSendingPendingOrder = startSendingPendingOrder;
    }

    public String getTimingForStock() {
        return timingForStock;
    }

    public void setTimingForStock(String timingForStock) {
        this.timingForStock = timingForStock;
    }

    public String getTimingForPendingOrder() {
        return timingForPendingOrder;
    }

    public void setTimingForPendingOrder(String timingForPendingOrder) {
        this.timingForPendingOrder = timingForPendingOrder;
    }

}
