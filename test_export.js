async function testExport() {
    // 1. Login
    const loginRes = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "minula@gmail.com", password: "admin123" })
    });
    
    if (!loginRes.ok) {
        console.error("Login failed:", loginRes.status, await loginRes.text());
        return;
    }
    
    const data = await loginRes.json();
    const token = data.data.token;
    console.log("Got token length:", token.length);
    
    // 2. Export
    const exportRes = await fetch("http://localhost:8080/api/v1/reports/export/sales", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    console.log("Export status:", exportRes.status);
    console.log("Headers:", [...exportRes.headers.entries()]);
    
    const text = await exportRes.text();
    console.log("Content length:", text.length);
    console.log("Preview:", text.substring(0, 200));
}

testExport();
