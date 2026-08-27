# Drug Use Prevention Support System - Backend

## 🛠️ Testing & CI Pipeline

- **CI Documentation**: See **[CI.md](../CI.md)** for detailed commands and workflows.

### Quick Commands

```bash
# Run automated tests
./mvnw test

# Static analysis & Linting
./mvnw checkstyle:check
./mvnw spotbugs:check

# Generate JaCoCo code coverage report
./mvnw jacoco:report
```