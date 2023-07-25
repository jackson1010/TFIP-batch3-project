package backEnd.Project.Model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GraphDetail {
    
     @JsonProperty("date_utc")
    private long dateUtc;
    private double open;
    private double high;
    private double low;
    private double close;
    private long volume;
    
    public long getDateUtc() {
        return dateUtc;
    }
    public void setDateUtc(long dateUtc) {
        this.dateUtc = dateUtc;
    }
    public double getOpen() {
        return open;
    }
    public void setOpen(double open) {
        this.open = open;
    }
    public double getHigh() {
        return high;
    }
    public void setHigh(double high) {
        this.high = high;
    }
    public double getLow() {
        return low;
    }
    public void setLow(double low) {
        this.low = low;
    }
    public double getClose() {
        return close;
    }
    public void setClose(double close) {
        this.close = close;
    }
    public long getVolume() {
        return volume;
    }
    public void setVolume(long volume) {
        this.volume = volume;
    }

    
}
