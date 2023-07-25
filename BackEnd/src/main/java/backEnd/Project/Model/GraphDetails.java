package backEnd.Project.Model;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GraphDetails {

     private Map<String, GraphDetail> items;

    public Map<String, GraphDetail> getItems() {
        return items;
    }

    public void setItems(Map<String, GraphDetail> items) {
        this.items = items;
    }

     
}
