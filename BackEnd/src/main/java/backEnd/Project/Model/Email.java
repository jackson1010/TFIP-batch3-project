package backEnd.Project.Model;

public class Email {
    private String toemail;
    private String name;
    private String password;

    public String getToemail() {
        return toemail;
    }

    public void setToemail(String toemail) {
        this.toemail = toemail;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // public String changePassword(String password) {
    //     String startText = "Your password is %s. \n\nPlease change your password when you login.\n\n";
    //     return String.format(startText, password);
    // }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public static String signUpSubject() {
        String text = "Welcome to Zin Investment Inc!";
        return text;
    }

    public static String fundsTopUp() {
        String text = "Funds Top Up Successful";
        return text;
    }

    public static String fundsTopUpFailed() {
        String text = "Funds Top Up Successful";
        return text;
    }

    public static String fundsWithdrawSuccess() {
        String text = "Funds withdraw processing";
        return text;
    }

}
