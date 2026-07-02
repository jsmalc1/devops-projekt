# Secure Event Ticketing Platform

Ovaj projekt demonstrira cjeloviti proces isporuke sigurne, višeslojne aplikacije primjenom modernih DevOps i DevSecOps principa.

## Arhitektura Sustava
Projekt koristi mikroservisni pristup s asinkronom obradom podataka:
- **Frontend** (Node.js): Web sučelje (Skalirano na 2 replike za Visoku Dostupnost).
- **API** (Node.js): REST API koji prima zahtjeve i stavlja ih u red čekanja (Skaliran na 2 replike).
- **Redis**: Queue/Cache sloj za asinkronu obradu.
- **Worker** (Node.js): Pozadinski servis koji čita iz Redisa i trajno zapisuje u bazu (1 replika).
- **PostgreSQL**: Relacijska baza podataka (Implementirana kao K8s StatefulSet za stabilnost podataka).

## Sigurnosne Značajke (DevSecOps)
- **Kontejneri:** Multi-stage build, Alpine Linux `node:20` slike, procesi se vrte kao *non-root* korisnici.
- **Kubernetes Security:** Tajne odvojene putem K8s `Secret` objekata, mrežna izolacija pomoću `NetworkPolicy`, least-privilege `ServiceAccount` i `RBAC`.
- **CI/CD Pipeline (GitHub Actions):** Paralelni *matrix build*, automatsko Trivy skeniranje kontejnerskih slika i dubinsko IaC skeniranje Kubernetes manifesta.

## 1. Lokalni razvoj (Docker Compose)
Za brzi lokalni razvoj i testiranje osiguran je Docker Compose okruženje.

**Pokretanje:**
1. Kopirati `.env.example` u `.env`
2. Pokreni naredbu: `docker compose up --build -d`
3. Aplikacija je dostupna na `http://localhost:3000`

## 2. Produkcijski deployment (Kubernetes)
Manifesti osiguravaju limits/requests za resurse i Health/Readiness probe koje garantiraju da servisi ne primaju promet prije nego se spoje na bazu i Redis.

**Pokretanje na klasteru:**
1. Primijeniti K8s manifeste:
    ```
    bash
    kubectl apply -f ./k8s/
    ```
2. Provjeriti status podova (sačekaj da StatefulSet inicijalizira bazu):
    ```
kubectl get pods -w
    ```
    kubectl get pods -w
    ```
3. Otvoriti portove za testiranje:
    ```
    kubectl port-forward service/frontend-service 3000:3000
    kubectl port-forward service/api-service 8080:8080
    ```