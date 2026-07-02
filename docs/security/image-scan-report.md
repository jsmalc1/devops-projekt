# Sigurnosno izvješće kontejnerskih slika (Trivy)

## Metodologija
Skeniranje je provedeno automatski unutar GitHub Actions CI/CD pipeline-a koristeći alat `aquasecurity/trivy-action`. 
Cilj skeniranja bio je identificirati i spriječiti ulazak ranjivosti (vulnerabilities) razina HIGH i CRITICAL u produkcijsko okruženje.

## Rezultati automatiziranog skeniranja

### 1. Frontend Servis (`projekt-frontend:latest`)
* **Osnovna slika:** `node:20-alpine`
* **Kritične (CRITICAL) ranjivosti:** 0
* **Visoke (HIGH) ranjivosti:** 0
* **Status:** PROLAZ (Quality Gate: Uspješno)

### 2. API Servis (`projekt-api:latest`)
* **Osnovna slika:** `node:20-alpine`
* **Kritične (CRITICAL) ranjivosti:** 0
* **Visoke (HIGH) ranjivosti:** 0
* **Status:** PROLAZ (Quality Gate: Uspješno)

### 3. Worker Servis (`projekt-worker:latest`)
* **Osnovna slika:** `node:20-alpine`
* **Kritične (CRITICAL) ranjivosti:** 0
* **Visoke (HIGH) ranjivosti:** 0
* **Status:** PROLAZ (Quality Gate: Uspjesno)

## Zaključak i korektivne mjere
Koristenjem multi-stage build procesa u Dockerfileovima, izbjegnuto je uvrstavanje razvojnih alata i dev ovisnosti u konacnu produkcijsku sliku. Odabirom minimalne alpine Linux distribucije, povrsina napada (attack surface) je svedena na minimum. Nisu pronadene ranjivosti koje krse sigurnosne politike i sve slike su sigurno pohranjene na GitHub Container Registry (GHCR).