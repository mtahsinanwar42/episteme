# Reference Data API

Base Path: **/api/v1/reference-data**

---

## 1. Get Topics

**GET /topics**  
Access: Public

### Notes

- Returns a list of topic names (string array) for dropdown usage.
- Data is loaded from `topics.txt` if available; otherwise fetched from configured Topics API and stored.

### Response (Example)

```json
{
  "success": true,
  "count": 3,
  "data": ["Hydrogen atom", "Quantum mechanics", "Machine learning"]
}
```

## 2. Get Countries

**GET /countries**  
Access: Public

### Notes

- Returns a list of country names (string array) for dropdown usage.
- Data is loaded from countries.txt if available; otherwise fetched from configured Countries URL and stored.

### Response (Example)

```json
{
  "success": true,
  "count": 3,
  "data": ["Afghanistan", "Albania", "Algeria"]
}
```
