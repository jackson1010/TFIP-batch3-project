package backEnd.Project.Config;

import org.springframework.web.socket.WebSocketHandler;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

public class CustomHandshakeInterceptor extends HttpSessionHandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {
        // Get the URI segment corresponding to the `user_id` from the request
        URI uri = new URI(request.getURI().toString());

        System.out.println(
                "-----------------------------------------------------------------------------------------------URL: "
                        + request.getURI().toString());

        List<NameValuePair> params = URLEncodedUtils.parse(uri, "UTF-8");
        for (NameValuePair param : params) {
            if (param.getName().equals("user_id")) {
                System.out.println("------------------------------" + param.getValue());
                attributes.put("user_id", param.getValue());
                break;
            }
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
            Exception ex) {
    }
}
