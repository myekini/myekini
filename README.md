<div align="center">
  <h1>Muhammad Yekini</h1>

  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&pause=1200&color=58A6FF&center=true&vCenter=true&width=550&height=42&lines=I+build+data+pipelines+that+think.;Senior+Data+Engineer+%7C+Fintech+%26+Banking;Real-Time+Streaming+%7C+Kafka+%E2%80%A2+Spark;Autonomous+AI+Systems+%7C+LangGraph+%E2%80%A2+RAG;Cloud+Unit-Economics+%7C+FinOps+Governance" alt="Typing Animation" />

  <p align="center">
    <a href="https://linkedin.com/in/myekini"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
    <a href="https://twitter.com/MohBuilds"><img src="https://img.shields.io/badge/X%20(Twitter)-000000?style=flat-square&logo=x&logoColor=white" alt="X" /></a>
    <a href="https://muhammadyk.medium.com/"><img src="https://img.shields.io/badge/Medium-12100E?style=flat-square&logo=medium&logoColor=white" alt="Medium" /></a>
    <a href="mailto:myekini1@gmail.com"><img src="https://img.shields.io/badge/Email-myekini1%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
  </p>
</div>

---

## Executive Overview
- **Track Record:** 5+ years designing and operating mission-critical financial data pipelines across fintech and digital banking (**WAYA Bank**, **Earnipay**, **Mobi Automation**, **Bincom Dev Center**).
- **Core Focus:** Distributed real-time stream processing (**Kafka**, **Spark Streaming**), resilient analytics engineering (**dbt**, **Airflow**), and autonomous AI agent systems (**LangGraph**, **pgvector**, **RAG**).
- **FinOps & Cloud Economics:** Cloud cost governance, unit economics modeling, and automated reconciliation architectures.
- **Ecosystem:** Founder of **[STACC](https://getstacc.org)** (Data & Tech Community) and creator of **[LOBB](https://lobb.ng)** (Tennis Court & Club Booking Platform).

---

## Production Impact & Experience

| Environment | Scope & High-Impact Engineering Metrics | Core Stack |
| :--- | :--- | :--- |
| **Fintech & Banking**<br/><sub>WAYA Bank • Earnipay</sub> | • **High-Volume Settlement:** Engineered event-driven ledger pipelines processing **$50M+ in cumulative transactions** with zero ledger drift.<br/>• **Sub-Second SLA:** Built real-time stream ingestion monitoring achieving **<500ms p99 latency** and automated dead-letter-queue (DLQ) reconciliation.<br/>• **High Availability:** Maintained **99.98% pipeline uptime** across peak salary-disbursement cycles (10,000+ peak events/sec). | `Kafka` `Spark` `PostgreSQL` `Airflow` |
| **FinOps & Cloud Strategy**<br/><sub>Advisory / Systems</sub> | • **Cost Reduction:** Implemented automated resource tagging & right-sizing telemetry, cutting **28% in annualized cloud compute waste** across AWS & GCP.<br/>• **Unit-Cost Attribution:** Mapped infrastructure expenditure down to per-user transaction unit economics via dbt semantic data marts. | `AWS Cost Explorer` `BigQuery` `dbt` `Python` |

---

## System Architecture & Technologies

| Layer | Technologies |
| :--- | :--- |
| **Streaming & Ingestion** | ![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=flat-square&logo=apache-kafka&logoColor=white) ![Apache Spark](https://img.shields.io/badge/Apache_Spark-E25A1C?style=flat-square&logo=apache-spark&logoColor=white) ![Apache Airflow](https://img.shields.io/badge/Apache_Airflow-017CEE?style=flat-square&logo=apache-airflow&logoColor=white) ![dbt](https://img.shields.io/badge/dbt-FF694B?style=flat-square&logo=dbt&logoColor=white) |
| **AI, Agents & Vector Search** | ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=flat-square&logo=python&logoColor=white) ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) |
| **Storage & Caching** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) |
| **Cloud & Infrastructure** | ![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white) ![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=flat-square&logo=terraform&logoColor=white) |

---

## Featured Systems

| Project | Focus Architecture | Target Stack | Status |
| :--- | :--- | :--- | :--- |
| **FinTrust** | Event-Driven Fraud Detection & Settlement Engine | `Kafka` `Spark` `FastAPI` `LangChain` | `Active Build` |
| **CloudMargin** | Autonomous Cloud Unit-Cost & FinOps Intelligence | `dbt` `Airflow` `pgvector` `Streamlit` | `System Spec` |
| **BankPulse** | Real-Time Core Banking Product Metrics | `dbt Core` `FastAPI` `LLM Agents` | `Design RFC` |
| **LOBB** | Real-Time Tennis Court & Club Booking Platform | [lobb.ng](https://lobb.ng) | `Production` |

<details open>
<summary><b>System Blueprint: FinTrust (Event-Driven Fraud Detection & Settlement)</b></summary>
<br/>

```mermaid
flowchart LR
    subgraph INGEST["1. Ingestion Tier"]
        TXN["Payment Transactions\n(20k+ eps)"] --> INGRESS["FastAPI Gateway"]
        INGRESS --> KAFKA["Apache Kafka\n(Partitioned Topics)"]
    end

    subgraph PROCESSING["2. Stream & ML Scoring"]
        KAFKA --> SPARK["Spark Streaming\n(Sliding Windows)"]
        SPARK --> FEAT["Feature Store\n& Anomaly Engine"]
        FEAT --> AGENT["LangGraph Agent\n(Risk Evaluation)"]
    end

    subgraph SETTLEMENT["3. Settlement & Storage"]
        AGENT -->|Approved| PG[("PostgreSQL Ledger\n(ACID Settlement)")]
        AGENT -->|Flagged| REDIS[("Redis Cache\n(Instant Block)")]
        AGENT -->|DLQ Error| DLQ["Dead-Letter Queue\n& Alert Hook"]
    end
```
</details>

<details>
<summary><b>System Blueprint: CloudMargin (Autonomous FinOps Intelligence Engine)</b></summary>
<br/>

```mermaid
flowchart LR
    subgraph SOURCES["1. Multi-Cloud Feeds"]
        AWS["AWS CUR (S3)"]
        GCP["GCP Export (BigQuery)"]
    end

    subgraph PIPELINE["2. Semantic Modeling"]
        AWS --> AIRFLOW["Apache Airflow\n(Scheduled Ingestion)"]
        GCP --> AIRFLOW
        AIRFLOW --> DBT["dbt Models\n(Unit-Cost Attribution)"]
    end

    subgraph INTELLIGENCE["3. AI Reasoning & Alerts"]
        DBT --> VEC[("pgvector\n(Cost Pattern Embeddings)")]
        VEC --> RAG["RAG Anomaly Agent\n(Root-Cause Diagnosis)"]
        RAG --> UI["Streamlit Dashboard\n& Slack Waste Alerts"]
    end
```
</details>

---

## Writing & Architecture Notes

Engineering deep dives on streaming architecture, agentic workflows, and cloud economics:

<!-- BLOG-POST-LIST:START -->
- [Best websites to learn code 2021](https://muhammadyk.medium.com/best-websites-to-learn-code-2021-5c8a53a9dec1?source=rss-8607d1202f88------2)
<!-- BLOG-POST-LIST:END -->

Read more on **[Medium (@muhammadyk)](https://muhammadyk.medium.com/)**.

---

## Activity

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=myekini&show_icons=true&theme=github_dark&hide_border=true&bg_color=0d1117&title_color=58a6ff&icon_color=58a6ff&text_color=c9d1d9" width="49%" alt="GitHub Stats" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=myekini&layout=compact&theme=github_dark&hide_border=true&bg_color=0d1117&title_color=58a6ff&text_color=c9d1d9" width="49%" alt="Top Languages" />
</p>

---

<div align="center">
  <p><b>Open for:</b> Real-Time Data Pipeline Architecture • FinOps Cloud Audits • Senior Engineering Inquiries</p>
  <sub>Direct contact: <a href="mailto:myekini1@gmail.com">myekini1@gmail.com</a></sub>
</div>
