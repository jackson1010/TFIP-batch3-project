package backEnd.Project.Model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import backEnd.Project.Config.DividendDateDeserializer;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Stock {
    private String user_id;
    @JsonProperty("symbol")
    private String symbol;

    @JsonProperty("longName")
    private String stockName;

    @JsonProperty("averageDailyVolume10Day")
    private Double qty;

    @JsonProperty("regularMarketPrice")
    private Double price;

    @JsonProperty("regularMarketChangePercent")
    private Double percentageChange;

    @JsonProperty("regularMarketOpen")
    private Double open;

    @JsonProperty("regularMarketDayLow")
    private Double low;

    @JsonProperty("regularMarketDayHigh")
    private Double high;

    // extra info
    @JsonProperty("bid")
    private Double bid;

    @JsonProperty("ask")
    private Double ask;

    @JsonProperty("bidSize")
    private Integer bidSize;

    @JsonProperty("askSize")
    private Integer askSize;

    @JsonProperty("epsTrailingTwelveMonths")
    private Double epsTrailingTwelveMonths;

    @JsonProperty("epsForward")
    private Double epsForward;

    @JsonProperty("marketCap")
    private Long marketCap;

    @JsonProperty("priceToBook")
    private Double priceToBook;

    @JsonProperty("fiftyTwoWeekHigh")
    private Double fiftyTwoWeekHigh;

    @JsonProperty("fiftyTwoWeekLow")
    private Double fiftyTwoWeekLow;

    @JsonProperty("fiftyTwoWeekHighChangePercent")
    private Double fiftyTwoWeekHighChangePercent;

    @JsonProperty("fiftyTwoWeekLowChangePercent")
    private Double fiftyTwoWeekLowChangePercent;

    @JsonProperty("averageDailyVolume3Month")
    private Long averageDailyVolume3Month;

    @JsonProperty("dividendDate")
    @JsonDeserialize(using = DividendDateDeserializer.class)
    private Object  dividendDate;

    @JsonProperty("trailingAnnualDividendRate")
    private Double trailingAnnualDividendRate;

    @JsonProperty("trailingPE")
    private Double trailingPE;

    @JsonProperty("forwardPE")
    private Double forwardPE;

    private GraphDetails graphDetails;

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

    public Double getQty() {
        return qty;
    }

    public void setQty(Double qty) {
        this.qty = qty;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getStockName() {
        return stockName;
    }

    public void setStockName(String stockName) {
        this.stockName = stockName;
    }

    public Double getPercentageChange() {
        return percentageChange;
    }

    public void setPercentageChange(Double percentageChange) {
        this.percentageChange = percentageChange;
    }

    public Double getOpen() {
        return open;
    }

    public void setOpen(Double open) {
        this.open = open;
    }

    public Double getLow() {
        return low;
    }

    public void setLow(Double low) {
        this.low = low;
    }

    public Double getHigh() {
        return high;
    }

    public void setHigh(Double high) {
        this.high = high;
    }

    public GraphDetails getGraphDetails() {
        return graphDetails;
    }

    public void setGraphDetails(GraphDetails graphDetails) {
        this.graphDetails = graphDetails;
    }

    public Double getBid() {
        return bid;
    }

    public void setBid(Double bid) {
        this.bid = bid;
    }

    public Double getAsk() {
        return ask;
    }

    public void setAsk(Double ask) {
        this.ask = ask;
    }

    public Integer getBidSize() {
        return bidSize;
    }

    public void setBidSize(Integer bidSize) {
        this.bidSize = bidSize;
    }

    public Integer getAskSize() {
        return askSize;
    }

    public void setAskSize(Integer askSize) {
        this.askSize = askSize;
    }

    public Double getEpsTrailingTwelveMonths() {
        return epsTrailingTwelveMonths;
    }

    public void setEpsTrailingTwelveMonths(Double epsTrailingTwelveMonths) {
        this.epsTrailingTwelveMonths = epsTrailingTwelveMonths;
    }

    public Double getEpsForward() {
        return epsForward;
    }

    public void setEpsForward(Double epsForward) {
        this.epsForward = epsForward;
    }

    public Long getMarketCap() {
        return marketCap;
    }

    public void setMarketCap(Long marketCap) {
        this.marketCap = marketCap;
    }

    public Double getPriceToBook() {
        return priceToBook;
    }

    public void setPriceToBook(Double priceToBook) {
        this.priceToBook = priceToBook;
    }

    public Double getFiftyTwoWeekHigh() {
        return fiftyTwoWeekHigh;
    }

    public void setFiftyTwoWeekHigh(Double fiftyTwoWeekHigh) {
        this.fiftyTwoWeekHigh = fiftyTwoWeekHigh;
    }

    public Double getFiftyTwoWeekLow() {
        return fiftyTwoWeekLow;
    }

    public void setFiftyTwoWeekLow(Double fiftyTwoWeekLow) {
        this.fiftyTwoWeekLow = fiftyTwoWeekLow;
    }

    public Double getFiftyTwoWeekHighChangePercent() {
        return fiftyTwoWeekHighChangePercent;
    }

    public void setFiftyTwoWeekHighChangePercent(Double fiftyTwoWeekHighChangePercent) {
        this.fiftyTwoWeekHighChangePercent = fiftyTwoWeekHighChangePercent;
    }

    public Double getFiftyTwoWeekLowChangePercent() {
        return fiftyTwoWeekLowChangePercent;
    }

    public void setFiftyTwoWeekLowChangePercent(Double fiftyTwoWeekLowChangePercent) {
        this.fiftyTwoWeekLowChangePercent = fiftyTwoWeekLowChangePercent;
    }

    public Long getAverageDailyVolume3Month() {
        return averageDailyVolume3Month;
    }

    public void setAverageDailyVolume3Month(Long averageDailyVolume3Month) {
        this.averageDailyVolume3Month = averageDailyVolume3Month;
    }

    public Double getTrailingAnnualDividendRate() {
        return trailingAnnualDividendRate;
    }

    public void setTrailingAnnualDividendRate(Double trailingAnnualDividendRate) {
        this.trailingAnnualDividendRate = trailingAnnualDividendRate;
    }

    public Double getTrailingPE() {
        return trailingPE;
    }

    public void setTrailingPE(Double trailingPE) {
        this.trailingPE = trailingPE;
    }

    public Double getForwardPE() {
        return forwardPE;
    }

    public void setForwardPE(Double forwardPE) {
        this.forwardPE = forwardPE;
    }

    public Object getDividendDate() {
        return dividendDate;
    }

    public void setDividendDate(Object dividendDate) {
        this.dividendDate = dividendDate;
    }

    


}
