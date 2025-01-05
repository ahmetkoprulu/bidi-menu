from OpenSSL import crypto
import os
from pathlib import Path

def generate_self_signed_cert(cert_dir: str = "ssl"):
    """Generate self-signed SSL certificates for development."""
    
    # Create directory if it doesn't exist
    cert_path = Path(cert_dir)
    cert_path.mkdir(parents=True, exist_ok=True)
    
    # Generate key
    k = crypto.PKey()
    k.generate_key(crypto.TYPE_RSA, 2048)
    
    # Generate certificate
    cert = crypto.X509()
    cert.get_subject().C = "US"
    cert.get_subject().ST = "California"
    cert.get_subject().L = "San Francisco"
    cert.get_subject().O = "AR Menu Development"
    cert.get_subject().OU = "Development"
    cert.get_subject().CN = "localhost"
    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(365*24*60*60)  # Valid for one year
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(k)
    cert.sign(k, 'sha256')
    
    # Save certificate
    with open(os.path.join(cert_dir, "cert.pem"), "wb") as f:
        f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
    
    # Save private key
    with open(os.path.join(cert_dir, "key.pem"), "wb") as f:
        f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
    
    print(f"Generated SSL certificates in {cert_dir}/")

if __name__ == "__main__":
    generate_self_signed_cert() 