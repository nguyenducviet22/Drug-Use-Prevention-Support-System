# Drug Use Prevention Support System

## 🛠️ Continuous Integration & Quality Safety Net

A Continuous Integration (CI) pipeline and code quality tooling have been set up for this project.

- For full pipeline instructions, local testing commands, and refactoring guidelines, refer to **[CI Documentation (CI.md)](./CI.md)**.

### Quick Start (Local Verification)

```bash
cd Back-end
./mvnw test               # Run all 548 regression tests
./mvnw checkstyle:check   # Check code formatting and style
./mvnw spotbugs:check     # Run static analysis and bug pattern detection
./mvnw verify             # Full build + quality + test suite
```