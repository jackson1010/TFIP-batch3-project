package backEnd.Project.Controller;

import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class SseController {

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping("/api/sse")
    public SseEmitter handleSse() {
        SseEmitter emitter = new SseEmitter();
        this.emitters.add(emitter);

        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));

        return emitter;
    }

    public void sendEventToUI(String message) {
        for (SseEmitter emitter : this.emitters) {
            try {
                emitter.send(message);
            } catch (Exception e) {
                this.emitters.remove(emitter);
            }
        }
    }

}
