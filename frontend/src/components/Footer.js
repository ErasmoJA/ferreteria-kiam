import React from 'react';

const Footer = ({ totalProducts }) => {
  return (
    <footer style={{ backgroundColor: '#2F3A42' }} className="text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Ferretería Kiam
            </h3>
            <p style={{ color: '#B0A58C' }}>
              Tu ferretería de confianza desde 2000. Calidad y servicio garantizado.
            </p>
            <div className="mt-4 text-sm" style={{ color: '#9CA3AF' }}>
              <p>✅ Datos en tiempo real</p>
              <p>✅ Inventario actualizado</p>
              <p>✅ Sistema de usuarios integrado</p>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Contacto
            </h3>
            <div className="space-y-2" style={{ color: '#B0A58C' }}>
              <p>📞 (871) 752-22092</p>
              <p>📧 kiamferreteria@gmail.com</p>
              <p>📍 San Federico #201, Boulevard San Antonio CP. 35015, Gómez Palacio, Durango, México</p>
            </div>
          </div>
          
          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Horarios
            </h3>
            <div className="space-y-2" style={{ color: '#B0A58C' }}>
              <p>Lunes a Viernes: 9:00AM - 8:00PM</p>
              <p>Sábados: 9:00AM - 8:00PM</p>
              <p>Domingos: 10:00AM - 3:00PM</p>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-slate-600 mt-8 pt-8 text-center" style={{ color: '#9CA3AF' }}>
          <p>&copy; 2024 Ferretería Kiam. Todos los derechos reservados.</p>
          <p className="text-xs mt-2">
            Sistema con autenticación - {totalProducts} productos disponibles
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;