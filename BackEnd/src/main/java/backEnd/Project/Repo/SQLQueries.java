package backEnd.Project.Repo;

public class SQLQueries {
  public static final String INSERT_USER = "INSERT INTO users(user_id, email, accountType) values(?,?,?)";
  public static final String GET_USER_BY_EMAIL = "SELECT * FROM users WHERE email=?";
  public static final String GET_STOCKS_BY_ID = "SELECT * FROM stock_orders WHERE user_id=?";
  public static final String INSERT_ACCOUNT_FUNDS_BY_USER_ID = "INSERT INTO account_funds(user_id, transaction_id, amount,currency,status,bankDetails,datetime) values(?,?,?,?,?,?,?)";
  public static final String GET_ACCOUNT_FUNDS_BY_USER_ID = "SELECT * FROM account_funds WHERE user_id=?";
  // public static final String GET_USER_BY_ID = "select * from users where
  // user_id=?";
  // public static final String GET_ACCOUNT_FUNDS_BY_TRANSACTION_ID = "select *
  // from account_funds where transaction_id=?";
  
  public static final String GET_USER_ID_EMAIL = "SELECT users.user_id, users.email FROM users JOIN account_funds ON users.user_id = account_funds.user_id WHERE account_funds.transaction_id = ?";
  public static final String INSERT_STOCK_ORDERS_BY_USER_ID = "INSERT INTO stock_orders(user_id, buyOrSell,symbol, name,orderType,price,quantity,amount) values(?,?,?,?,?,?,?,?)";
  public static final String INSERT_PENDING_ORDERS_BY_USER_ID = "INSERT INTO pending_orders(user_id, buyOrSell,symbol, name,orderType,price,quantity,amount, status) values(?,?,?,?,?,?,?,?,?)";
  public static final String GET_PENDING_ORDERS_BY_USER_ID = "SELECT * FROM pending_orders WHERE user_id=?";
  public static final String DELETE_PENDING_ORDERS = "DELETE FROM pending_orders WHERE user_id = ? AND buyOrSell=? AND symbol = ? AND orderType=? AND price = ? AND quantity = ?";

}
