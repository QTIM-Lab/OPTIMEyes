# SSL

## Self signed

```bash
mkdir -p flask_server/certs/
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
mv cert.pem flask_server/certs/
mv key.pem flask_server/certs/
```
Echo what ever domain name you entered to `/etc/hosts`.

Ex: `optimeyes.co`

```bash
echo "0.0.0.0 optimeyes.co" | sudo tee -a /etc/hosts
```

## Certbot (real purchased certs)

[certbot](https://certbot.eff.org/)
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot certonly --standalone
```
You will get instructions on where it is on your machine. Copy to `flask_server/certs` folder.

When it expires in ~90 days:
```bash
sudo certbot renew
```