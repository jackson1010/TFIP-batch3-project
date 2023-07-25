package backEnd.Project.Model;
import java.util.List;
import java.util.UUID;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.json.Json;
import jakarta.json.JsonObject;

@Document(collection = "users")
public class User {

    private String id;
    private String username;
    private String email;
    private String password;
    private String firstname;
    private String lastname;
    private List<AccountFund> funds;

    public User() {
    }

    public User(String email2, String firstName2, String lastName2, String encode) {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public List<AccountFund> getFunds() {
        return funds;
    }

    public void setFunds(List<AccountFund> funds) {
        this.funds = funds;
    }

    public static String createID() {
        UUID uuid = UUID.randomUUID();
        String uuidString = uuid.toString();
        return uuidString.substring(0, 8);
    }

    public static JsonObject toJSON(User user) {
        return Json.createObjectBuilder()
                .add("firstname", user.getFirstname())
                .add("lastname", user.getLastname())
                .add("email", user.getEmail())
                .add("password", user.getPassword())
                .build();
    }

}
