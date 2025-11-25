# Raspberry Pi diegimo vadovas

Šis gidas skirtas Raspberry Pi 4 (64-bit OS) įrenginiui su mažiausiai 4 GB RAM ir 64 GB microSD (rekomenduojama). Instaliacija paruoš edge pipeline, backend ir frontend konteinerius.

## Reikalavimai
- Raspberry Pi 4 (ar naujesnis) su 64-bit Raspberry Pi OS
- 64 GB ar didesnė microSD kortelė
- Interneto ryšys ir SSH prieiga
- `sudo` teisės

## Paruošimas
1. Prisijunkite prie Raspberry Pi per SSH.
2. Atsinaujinkite paketų sąrašą ir įsitikinkite, kad turite pakankamai laisvos vietos SD kortelėje.

## Instaliacija
Paleiskite instaliavimo skriptą iš projekto šaknies (arba leiskite jam pats susiklonuoti repo į `/opt/anpr-variklis`).

```bash
sudo chmod +x scripts/install_anpr_rpi.sh
sudo ./scripts/install_anpr_rpi.sh
```

Skriptas atliks:
- OS atnaujinimą
- Docker ir Docker Compose plugin diegimą
- GStreamer pluginų ir Coral EdgeTPU runtime diegimą
- Repozitorijos klonavimą (jei jos nėra) į `/opt/anpr-variklis`
- `.env.example` kopijavimą į `.env`
- `docker compose build` ir `docker compose up -d`
- `systemd` serviso `/etc/systemd/system/anpr.service` sukūrimą ir įjungimą

## Serviso valdymas
```
sudo systemctl start anpr
sudo systemctl stop anpr
sudo systemctl status anpr
```

## Prieigos taškai
- Dashboard: `http://<RPi-IP>:3000`
- Backend health: `http://<RPi-IP>:8000/healthz`

## Problemų sprendimas
- Patikrinkite Docker būseną: `sudo systemctl status docker`
- Žiūrėkite konteinerių logus: `cd /opt/anpr-variklis && docker compose logs backend` (arba `edge`, `frontend`)
- Jei pakeitėte `.env`, paleiskite `docker compose up -d --build`
