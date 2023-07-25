package backEnd.Project.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;

import backEnd.Project.Services.EmailServices;
import backEnd.Project.Services.ProjectServices;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class StripeController {

    @Autowired
    private ProjectServices projectServices;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private SseController sseController;

    @Value("${spring.data.stripe.api.key}")
    private String stripApiKey;

    @Value("${spring.data.stripe.webhook.key}")
    private String stripeWebhookKey;

    @PostMapping(path = "api/pay", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> pay(@RequestBody Map<String, String> result) {
        Map<String, String> responseMap = new HashMap<>();

        Stripe.apiKey = stripApiKey;

        String paymentMethodId = result.get("id");
        double amountInDollars = Double.parseDouble(result.get("amount"));
        long amount = Math.round(amountInDollars * 100);
        String accountId = result.get("accountId");

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setCurrency("usd")
                .setAmount(amount) // amount in cents
                .setPaymentMethod(paymentMethodId)
                .setConfirm(true)
                .build();
        try {
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            responseMap.put("paymentIntentId", paymentIntent.getId());
            responseMap.put("status", "processing, please hold on.");
            projectServices.createAccountBalance(paymentIntent.getId(), amountInDollars, "usd", accountId);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        } catch (Exception e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader, HttpServletRequest request) throws MessagingException {
        Event event = null;
        String email = null;


        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeWebhookKey);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
                String transaction_id = paymentIntent.getId();
                long amount = paymentIntent.getAmount();
                double amountInDouble = (double) amount / 100.0;
                String currency = paymentIntent.getCurrency();
                String status = paymentIntent.getStatus();
                Long datetime = paymentIntent.getCreated();
                email = projectServices.updateAccountBalance(transaction_id, amountInDouble, currency, status,
                        datetime);
                emailServices.sendFundsEmail(email, amountInDouble, 1);
                sseController.sendEventToUI("Payment successful!");
                break;
            case "payment_intent.payment_failed":
                paymentIntent = (PaymentIntent) event.getData().getObject();
                String f_transaction_id = paymentIntent.getId();
                long f_amount = paymentIntent.getAmount();
                double f_amountInDouble = (double) f_amount / 100.0;
                String f_currency = paymentIntent.getCurrency();
                String f_status = paymentIntent.getStatus();
                Long f_datetime = paymentIntent.getCreated();
                email = projectServices.updateAccountBalance(f_transaction_id, f_amountInDouble, f_currency, f_status,
                        f_datetime);
                emailServices.sendFundsEmail(email, f_amountInDouble, 0);
                sseController.sendEventToUI("Payment unsuccessful!");
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType());
        }

        return ResponseEntity.ok().build();
    }

}
