# WorkFlow for the APP:

```markdown
Workflow for your airport luggage handling app based on the rubric and sequence of activities:

---

### **Workflow for Airport Luggage Handling App**

1. **Administrator Setup**

    * Add flights, staff (airline, gate, ground), and passengers.
    * Ensure each flight has passengers and assigned gates.

2. **Passenger Check-in**

    * Airline staff check in passengers at the **check-in counter**.
    * Passenger status changes to **CHECKED_IN**.
    * Bags are added to the system with location **CHECKIN_COUNTER**.

3. **Security Clearance**

    * Ground staff at **security** process bags from check-in counters.
    * Bags are either:

        * **CLEARED → Move to GATE**, or
        * **SECURITY_VIOLATION → Notify Airline Staff → Remove Bags and Passenger asynchronously**.

4. **Gate Boarding**

    * Gate staff logs in, selects a gate, and views flight info and passengers.
    * Passengers are **BOARDING**.
    * Only **CLEARED** bags at the **GATE** can be loaded.

5. **Bag Loading**

    * Ground staff at the gate checks passenger is **BOARDED**.
    * Loads all passenger’s **CLEARED** bags onto the plane.
    * Bag location updates to **LOADED**.

6. **Flight Departure**

    * Gate staff confirms all passengers boarded and all bags loaded.
    * Notify administrator to remove flight, passengers, and bags from the system.

---

### **Passenger Status vs Bag Workflow**

| Bag Status         | Passenger Status Required | Next Action                    |
| ------------------ | ------------------------- | ------------------------------ |
| CHECKIN_COUNTER    | CHECKED_IN                | Queue for security             |
| SECURITY_CHECK     | CHECKED_IN                | Security check by ground staff |
| GATE (CLEARED)     | BOARDED                   | Load onto plane                |
| LOADED             | BOARDED                   | Flight ready for departure     |
| SECURITY_VIOLATION | Any                       | Notify airline staff           |
```