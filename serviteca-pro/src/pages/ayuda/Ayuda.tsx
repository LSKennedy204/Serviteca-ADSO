/**
 * src/pages/ayuda/Ayuda.tsx
 * Manual de usuario en secciones desplegables.
 */

import { useState, type ReactNode } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface SeccionProps {
  titulo: string;
  children: ReactNode;
}

function Seccion({ titulo, children }: SeccionProps) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div className="border border-slate-700 rounded-2xl overflow-hidden mb-3">
      <button
        onClick={() => setAbierta(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left
                   hover:bg-slate-700/40 transition-colors"
        style={{ backgroundColor: abierta ? 'rgba(30,41,59,0.8)' : '#1E293B' }}
        aria-expanded={abierta}
      >
        <span className="font-semibold text-white text-sm">{titulo}</span>
        <ChevronDown
          size={18}
          className={`text-yellow-400 transition-transform shrink-0 ${abierta ? 'rotate-180' : ''}`}
        />
      </button>

      {abierta && (
        <div
          className="px-5 py-4 border-t border-slate-700 text-sm text-slate-300 space-y-2
                     leading-relaxed animate-fade-in"
          style={{ backgroundColor: '#1E293B' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function Paso({ n, texto }: { n: number; texto: string }) {
  return (
    <div className="flex gap-3">
      <span
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                   text-xs font-bold"
        style={{ backgroundColor: '#FACC15', color: '#0F0F10' }}
      >
        {n}
      </span>
      <p>{texto}</p>
    </div>
  );
}

function Nota({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 px-3 py-2 rounded-lg text-xs text-blue-300 border border-blue-800"
         style={{ backgroundColor: '#0F0F10' }}>
      ℹ️ {children}
    </div>
  );
}

export default function Ayuda() {
  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb migas={[{ label: 'Ayuda' }]} />

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle size={22} className="text-yellow-400" />
          Manual de Usuario
        </h1>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Haz clic en cada sección para expandir las instrucciones. Sigue los pasos en orden.
      </p>

      {/* ── Sección 1 ── */}
      <Seccion titulo="1. Iniciar sesión">
        <Paso n={1} texto='Abre el navegador y ve a http://localhost:3000.' />
        <Paso n={2} texto='Ingresa tu usuario y contraseña en los campos correspondientes.' />
        <Paso n={3} texto='Haz clic en el ícono del ojo 👁 para mostrar u ocultar la contraseña si lo necesitas.' />
        <Paso n={4} texto='Haz clic en el botón "Ingresar". El sistema validará tus credenciales.' />
        <Paso n={5} texto='Si las credenciales son correctas, serás redirigido al panel de inicio.' />
        <Nota>Si ves "Complete todos los campos.", asegúrate de haber escrito usuario y contraseña. Si ves "Usuario o contraseña incorrectos.", verifica que estén escritos correctamente.</Nota>
      </Seccion>

      {/* ── Sección 2 ── */}
      <Seccion titulo="2. Registrar un cliente">
        <Paso n={1} texto='En el menú lateral, haz clic en "Clientes" y luego en "Agregar".' />
        <Paso n={2} texto='Completa todos los campos: Identificación, Nombres, Apellidos, Correo y Celular.' />
        <Paso n={3} texto='Los campos marcados con asterisco (*) son obligatorios.' />
        <Paso n={4} texto='El celular debe tener exactamente 10 dígitos y el correo debe tener formato válido (ej: usuario@dominio.com).' />
        <Paso n={5} texto='Haz clic en "Guardar". Si todo está bien, verás el mensaje "Cliente registrado correctamente." y el formulario se limpiará.' />
        <Paso n={6} texto='Si la identificación ya está registrada, verás "Ya existe un cliente registrado con esta identificación."' />
        <Nota>Puedes hacer clic en "Limpiar" en cualquier momento para borrar los datos del formulario.</Nota>
      </Seccion>

      {/* ── Sección 3 ── */}
      <Seccion titulo="3. Consultar un cliente">
        <Paso n={1} texto='En el menú lateral, haz clic en "Clientes" → "Consultar".' />
        <Paso n={2} texto='Escribe la identificación del cliente en el campo de búsqueda.' />
        <Paso n={3} texto='Haz clic en el botón azul "Consultar".' />
        <Paso n={4} texto='Si el cliente existe, se mostrarán todos sus datos debajo del formulario.' />
        <Paso n={5} texto='Desde los resultados puedes ir directamente a "Asignar Servicio a este Cliente" o "Ver todos los clientes".' />
        <Nota>Si ves "El cliente con la identificación ingresada no se encuentra registrado.", verifica que la identificación esté escrita correctamente.</Nota>
      </Seccion>

      {/* ── Sección 4 ── */}
      <Seccion titulo="4. Listar clientes">
        <Paso n={1} texto='En el menú lateral, haz clic en "Clientes" → "Listar".' />
        <Paso n={2} texto='Verás una tabla con todos los clientes registrados, ordenados del más reciente al más antiguo.' />
        <Paso n={3} texto='Usa el cuadro de búsqueda para filtrar por identificación, nombre, apellido, correo o celular.' />
        <Paso n={4} texto='El contador "Mostrando X de Y" te indica cuántos resultados coinciden con tu búsqueda.' />
        <Paso n={5} texto='Haz clic en "Recargar" para actualizar la lista.' />
      </Seccion>

      {/* ── Sección 5 ── */}
      <Seccion titulo="5. Registrar un carro">
        <Paso n={1} texto='En el menú lateral, haz clic en "Carros" → "Agregar".' />
        <Paso n={2} texto='Ingresa la Placa, Marca y Modelo del vehículo.' />
        <Paso n={3} texto='La placa se convierte automáticamente a mayúsculas y sin espacios mientras escribes (ej: "abc 123" → "ABC123").' />
        <Paso n={4} texto='La placa debe tener el formato: 3 letras seguidas de 3 números (ej: ABC123).' />
        <Paso n={5} texto='Haz clic en "Guardar".' />
        <Nota>Si la placa ya existe, verás "Ya existe un carro registrado con esta placa."</Nota>
      </Seccion>

      {/* ── Sección 6 ── */}
      <Seccion titulo="6. Consultar un carro">
        <Paso n={1} texto='En el menú lateral, haz clic en "Carros" → "Consultar".' />
        <Paso n={2} texto='Ingresa la placa del vehículo (se convierte automáticamente a mayúsculas).' />
        <Paso n={3} texto='Haz clic en "Consultar".' />
        <Paso n={4} texto='Desde los resultados puedes ir a "Ver Servicios de este Carro" o "Registrar Servicio".' />
      </Seccion>

      {/* ── Sección 7 ── */}
      <Seccion titulo="7. Registrar un servicio">
        <Paso n={1} texto='En el menú lateral, haz clic en "Servicios" → "Agregar".' />
        <Paso n={2} texto='Ingresa la placa del vehículo. Si está registrado, aparecerá automáticamente la marca y modelo en verde.' />
        <Paso n={3} texto='Ingresa la identificación del cliente. Si está registrado, aparecerá su nombre en verde.' />
        <Paso n={4} texto='Selecciona la fecha del servicio (por defecto aparece la fecha de hoy).' />
        <Paso n={5} texto='Selecciona el tipo de servicio de la lista: Cambio de aceite, Sincronización, Alineación o Lavado.' />
        <Paso n={6} texto='Haz clic en "Guardar". Verás el mensaje "Servicio registrado correctamente." y los campos de placa e identificación se limpiarán.' />
        <Nota>Puedes llegar a esta pantalla directamente desde la consulta de un cliente o un carro y los campos se precompletarán automáticamente.</Nota>
      </Seccion>

      {/* ── Sección 8 ── */}
      <Seccion titulo="8. Consultar servicios de un carro">
        <Paso n={1} texto='En el menú lateral, haz clic en "Servicios" → "Consultar".' />
        <Paso n={2} texto='Ingresa la placa del vehículo y haz clic en "Consultar".' />
        <Paso n={3} texto='Verás la marca, modelo, total de servicios y una tabla con el historial del más reciente al más antiguo.' />
        <Paso n={4} texto='Desde aquí puedes agregar un nuevo servicio a ese carro o consultar otra placa.' />
        <Nota>También puedes llegar al historial desde "Listar Carros" haciendo clic en el botón "Historial" de cualquier fila.</Nota>
      </Seccion>

      {/* ── Sección 9 ── */}
      <Seccion titulo="9. Listar servicios">
        <Paso n={1} texto='En el menú lateral, haz clic en "Servicios" → "Listar".' />
        <Paso n={2} texto='Verás todos los servicios registrados con placa, vehículo, cliente, fecha y tipo.' />
        <Paso n={3} texto='Usa el cuadro de texto para filtrar por cualquier campo.' />
        <Paso n={4} texto='Usa el desplegable "Todos los tipos" para filtrar por tipo de servicio específico.' />
        <Paso n={5} texto='Ambos filtros funcionan al mismo tiempo.' />
      </Seccion>

      {/* ── Sección 10 ── */}
      <Seccion titulo="10. Cerrar sesión">
        <Paso n={1} texto='Haz clic en "Salir" en la parte inferior del menú lateral.' />
        <Paso n={2} texto='Aparecerá un mensaje de confirmación: "¿Desea cerrar la sesión?".' />
        <Paso n={3} texto='Haz clic en "Sí, salir" para confirmar o en "Cancelar" para volver.' />
        <Paso n={4} texto='Al confirmar, la sesión se cierra y eres redirigido a la pantalla de login.' />
        <Nota>La sesión expira automáticamente después de 24 horas sin actividad.</Nota>
      </Seccion>
    </div>
  );
}
