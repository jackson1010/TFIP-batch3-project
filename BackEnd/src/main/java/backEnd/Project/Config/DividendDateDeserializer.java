package backEnd.Project.Config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import backEnd.Project.Model.Dividend;

import java.io.IOException;


public class DividendDateDeserializer extends JsonDeserializer<Object> {
     @Override
    public Object deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        JsonNode node = parser.getCodec().readTree(parser);
        if (node.isObject()) {
            ObjectMapper mapper = (ObjectMapper) parser.getCodec();
            return mapper.treeToValue(node, Dividend.class);
        }
        return node.longValue();
    }
    
}
