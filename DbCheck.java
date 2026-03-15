import java.sql.*;

public class DbCheck {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/retailiq";
        String user = "root";
        String password = "root";
        
        Connection conn = DriverManager.getConnection(url, user, password);
        Statement stmt = conn.createStatement();
        
        System.out.println("Checking orders table...");
        ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM orders");
        if (rs.next()) {
            System.out.println("Total orders: " + rs.getInt(1));
        }
        
        System.out.println("\nLast 10 orders by ID:");
        rs = stmt.executeQuery("SELECT order_id, order_date, customer_id, total_amount FROM orders ORDER BY order_id DESC LIMIT 10");
        while (rs.next()) {
            System.out.println("ID: " + rs.getLong("order_id") + " | Date: " + rs.getTimestamp("order_date") + " | CustID: " + rs.getLong("customer_id") + " | Total: " + rs.getBigDecimal("total_amount"));
        }
        
        conn.close();
    }
}
