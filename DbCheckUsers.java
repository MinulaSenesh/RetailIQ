import java.sql.*;

public class DbCheckUsers {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/retailiq";
        String user = "root";
        String password = "root123";
        
        Connection conn = DriverManager.getConnection(url, user, password);
        Statement stmt = conn.createStatement();
        
        System.out.println("--- USERS TABLE ---");
        ResultSet rs = stmt.executeQuery("SELECT user_id, email, username, role FROM users");
        while (rs.next()) {
            System.out.println("ID: " + rs.getLong("user_id") + " | Email: " + rs.getString("email") + " | Username: " + rs.getString("username") + " | Role: " + rs.getString("role"));
        }
        
        System.out.println("\n--- CUSTOMERS TABLE ---");
        rs = stmt.executeQuery("SELECT customer_id, email, user_id FROM customers");
        while (rs.next()) {
            System.out.println("ID: " + rs.getLong("customer_id") + " | Email: " + rs.getString("email") + " | UserID: " + rs.getObject("user_id"));
        }
        
        conn.close();
    }
}
