package backEnd.Project.Model;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StockList {
    private List<Stock> quotes;

    public List<Stock> getQuotes() {
        return quotes;
    }

    public void setQuotes(List<Stock> quotes) {
        this.quotes = quotes;
    }

}
