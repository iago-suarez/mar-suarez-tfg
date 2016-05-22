# mar-suarez-tfg
Este es el spftware que da soporte al Trabajo Fin de Grado de Mar Suárez


# Instalar Kurento

Probado en ubuntu 14.04

    echo "deb http://ubuntu.kurento.org trusty kms6" | sudo tee /etc/apt/sources.list.d/kurento.list
    wget -O - http://ubuntu.kurento.org/kurento.gpg.key | sudo apt-key add -
    sudo apt-get update
    sudo apt-get install libglib2.0-0
    sudo apt-get install -f kurento-media-server-6.0

El motivo por el que hay que instalar libglib2.0-0 antes es que:

The problem was that kurento is providing version of glib newer than the default in ubuntu 14.04, this can cause problems is you already have libglib2.0 already installed and not updated because during the update is requiring the installation of newer dependencies and apt-get complains if you are not installing the library directly or performing an apt-get dist-upgrade –

    sudo service kurento-media-server-6.0 start

# Descargar y Ejecutar el proyecto

    git clone https://github.com/iago-suarez/mar-suarez-tfg.git
    sudo apt-get install -y apache2
    sudo cp -r mar-suarez-tfg/ /var/www/html/
    sudo chown -R www-data:www-data /var/www/html/mar-suarez-tfg/

Ahora que tanto el apache como el servidor de Kurento ya están funcionando, podemos acceder en el navegador a la URL:

    http://127.0.0.1/mar-suarez-tfg/
    
NOTA: En la entrada de texto source URL debemos cambiar la ruta por la ruta 
total al video del repositorio del proyecto.