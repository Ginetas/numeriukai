# Linux diegimo vadovas

Ši instrukcija skirta Debian/Ubuntu serveriams ar darbo stotims. Skriptas pasirūpins Docker, Compose plugin, projekto klonavimu ir pilno stack paleidimu.

## Reikalavimai
- Debian arba Ubuntu 20.04+ su `sudo` teisėmis
- Interneto ryšys
- 4+ GB RAM rekomenduojama

## Instaliacija
Paleiskite skriptą kaip root arba per `sudo` iš projekto katalogo (jei repo dar nėra – skriptas jį susiklonuos į `/opt/anpr-variklis`).

```bash
sudo chmod +x scripts/install_anpr_linux.sh
sudo ./scripts/install_anpr_linux.sh
```

Skriptas atliks:
- Sistemos atnaujinimą (`apt update && apt upgrade`)
- Docker ir Docker Compose plugin diegimą
- Repozitorijos klonavimą (jei reikia) į `/opt/anpr-variklis`
- `.env.example` kopijavimą į `.env`
- `docker compose build` ir `docker compose up -d`

## Paleidimas ir stabdymas
```
cd /opt/anpr-variklis
docker compose up -d
docker compose down
```

## Problemų sprendimas
- Patikrinkite Docker servisą: `sudo systemctl status docker`
- Žiūrėkite logus: `docker compose logs backend` (arba kito serviso pavadinimą)
- Po `.env` keitimų: `docker compose up -d --build`
