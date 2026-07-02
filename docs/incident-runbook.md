# DevSecOps Incident Runbook

Ovaj dokument definira operativne procedure i korake za dijagnostiku (*troubleshooting*) te oporavak aplikacije u slučaju produkcijskih incidenata.

## Incident 1: Pad baze podataka (PostgreSQL)
**Simptomi:**
* API Readiness probe počinje padati (`UNAVAILABLE`) jer ne može potvrditi vezu s bazom.
* Worker servis prijavljuje `Connection timeout` ili `Error` u logovima i prestaje obrađivati Redis red čekanja.
* Baza nestaje iz klastera ili je zapela u `CrashLoopBackOff`.

**Dijagnostika:**
1. Provjeriti status podova: `kubectl get pods -l app=postgres`
2. Pregledati logove baze: `kubectl logs statefulset/postgres-statefulset`
3. Provjeriti status perzistentnog volumena (PVC): `kubectl get pvc postgres-storage`

**Korektivne mjere:**
1. Budući da PostgreSQL koristi `StatefulSet`, brisanje poda rezultirat će automatskim ponovnim kreiranjem na istom PVC disku bez gubitka podataka:
   `kubectl delete pod postgres-statefulset-0`
2. Nakon podizanja baze, Kubernetes će automatski vratiti API i Worker servise u `Ready` stanje.

## Incident 2: Pogrešan Image Tag (Neuspješan Deployment)
**Simptomi:**
* Novi podovi za aplikaciju (npr. Frontend ili API) zapeli su u statusu `ImagePullBackOff` ili `ErrImagePull`.
* Aplikacija je i dalje dostupna korisnicima, ali se stara verzija ne gasi (zbog Rolling Update mehanizma).

**Dijagnostika:**
1. Detaljan opis greške: `kubectl describe pod -l app=api` (Tražiti *Failed to pull image* poruke).
2. Provjera povijesti isporuka: `kubectl rollout history deployment/api-deployment`

**Korektivne mjere (Rollback):**
Korištenje Kubernetes "undo" značajke za trenutno vraćanje na prethodnu radnu verziju:
`kubectl rollout undo deployment/api-deployment`

## Incident 3: Neispravna konfiguracija / Tajne (Secrets)
**Simptomi:**
* Baza podataka zapinje u statusu `CreateContainerConfigError`.
* API ili Worker se ruše s greškom: `FATAL: password authentication failed for user "postgres"`.

**Dijagnostika:**
1. Provjeriti jesu li tajne (lozinke) ispravno dekodirane. Česta greška je izostavljanje Base64 enkodiranja prilikom izrade YAML-a ili uvođenje skrivenih `\n` (novi red) znakova.

**Korektivne mjere:**
1. Ponovno generirati *Secret* s čistim Base64 stringovima u terminalu: `echo -n "prava_lozinka" | base64`
2. Urediti konfiguraciju i primijeniti promjene: `kubectl apply -f k8s/01-config.yaml`
3. Prisilno restartati ovisne servise kako bi povukli nove tajne:
   `kubectl rollout restart deployment/api-deployment deployment/worker-deployment`