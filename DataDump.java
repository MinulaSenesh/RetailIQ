
import java.sql.*;
import java.util.*;

public class DataDump {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/retailiq";
        String user = "root";
        String password = "root123";
        
        Connection conn = DriverManager.getConnection(url, user, password);
        Statement stmt = conn.createStatement();
        
        System.out.println("--- LATEST 50 ORDERS ---");
        ResultSet rs = stmt.executeQuery("SELECT o.order_id, o.order_date, c.first_name, c.last_name, o.status FROM orders o JOIN customers c ON o.customer_id = c.customer_id ORDER BY o.order_id DESC LIMIT 50");
        while (rs.next()) {
            System.out.println(String.format("#%d | %s | %s %s | %s", 
                rs.getLong("order_id"), 
                rs.getTimestamp("order_date"), 
                rs.getString("first_name"), 
                rs.getString("last_name"), 
                rs.getString("status")));
        }
        
        System.out.println("\n--- ORDERS DATED 2026-04-01 ---");
        rs = stmt.executeQuery("SELECT order_id, status FROM orders WHERE DATE(order_date) = '2026-04-01' LIMIT 20");
        while (rs.next()) {
            System.out.println("#" + rs.getLong("order_id") + " " + rs.getString("status"));
        }
        
        conn.close();
    }
}
