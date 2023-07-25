package backEnd.Project.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import backEnd.Project.Model.Email;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServices {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendSignUpMessage(Email email) throws MessagingException {

        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(email.getToemail());
        helper.setSubject(Email.signUpSubject());

        // Create Thymeleaf context and set variables
        Context context = new Context();
        context.setVariable("Username", email.getName());

        // Process the Thymeleaf template with the context
        String htmlContent = templateEngine.process("signup", context);
        // Set the HTML content
        helper.setText(htmlContent, true);

        ClassPathResource image = new ClassPathResource("welcome.png");
        helper.addInline("welcome", image);

        emailSender.send(message);
    }

    public void sendFundsEmail(String email, double amount, int i) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(email);

        // Create Thymeleaf context and set variables
        Context context = new Context();
        context.setVariable("amount", amount);

        if (i == 1) {
            helper.setSubject(Email.fundsTopUp());
            context.setVariable("Congrats", "Congrats");
            context.setVariable("success", "successful");
        } else {
            helper.setSubject(Email.fundsTopUpFailed());
            context.setVariable("Congrats", "Sorry");
            context.setVariable("success", "unsuccessful. Please try again.");
        }

        // Process the Thymeleaf template with the context
        String htmlContent = templateEngine.process("funds", context);

        // Set the HTML content
        helper.setText(htmlContent, true);

        // image
        ClassPathResource image = new ClassPathResource("funds.png");

        helper.addInline("funds", image);

        emailSender.send(message);
    }

    public void sendFundsEmailWithDraw(String email, Double amount, String bankName, String account)
            throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(email);
        helper.setSubject(Email.fundsWithdrawSuccess());

        // Create Thymeleaf context and set variables
        Context context = new Context();
        context.setVariable("amount", amount);
        context.setVariable("bankName", bankName);
        context.setVariable("account", account);
        String htmlContent = templateEngine.process("withdraw", context);

        // Set the HTML content
        helper.setText(htmlContent, true);

        // image
        ClassPathResource image = new ClassPathResource("funds.png");
        // Process the Thymeleaf template with the context

        helper.addInline("funds", image);

        emailSender.send(message);
    }

}
