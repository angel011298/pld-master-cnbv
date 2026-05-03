export const quizPart3 = [
  {
    "pregunta": "¿Qué es una 'operación estructurada' o 'fraccionada' en el contexto de la identificación de operaciones sospechosas?",
    "opciones": [
      "La división deliberada de una cantidad mayor de dinero en múltiples transacciones de menor monto para evadir los umbrales de reporte obligatorio",
      "Una operación financiera que involucra más de dos contrapartes en diferentes países simultáneamente",
      "La liquidación de un crédito en varias cuotas según el calendario pactado con el banco",
      "Una operación de inversión que combina diferentes instrumentos financieros en un solo portafolio"
    ],
    "respuesta_correcta": 0,
    "explicacion": "La estructuración o fraccionamiento es la división deliberada de cantidades de dinero en transacciones múltiples de menor monto para no superar los umbrales que obligan al reporte (ej. USD 10,000). Es un delito en sí mismo y una señal de alerta grave que el sistema de monitoreo debe detectar analizando transacciones vinculadas.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "GAFI - Tipologías LD; Guía CNBV - Señales de Alerta; Disposiciones de Carácter General CNBV"
  },
  {
    "pregunta": "¿Qué significa que una transacción 'no corresponde con el perfil del cliente' en materia de PLD/FT?",
    "opciones": [
      "Que el cliente realizó la operación fuera del horario habitual de atención bancaria",
      "Que la operación se desvía significativamente de lo esperado según la actividad económica, origen de recursos y comportamiento histórico del cliente establecido en el KYC",
      "Que el cliente utilizó un producto bancario distinto al que habitualmente contrata",
      "Que la operación se realizó en una sucursal diferente a la sucursal de registro del cliente"
    ],
    "respuesta_correcta": 1,
    "explicacion": "Una transacción que no corresponde al perfil del cliente es aquella que se desvía del comportamiento esperado definido en el KYC: montos inusuales, frecuencias atípicas, tipos de operación incongruentes con su actividad económica u origen de recursos distinto al declarado. Esta desviación activa el proceso de análisis para determinar si procede un ROS.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Perfil Transaccional; GAFI Rec. 10"
  },
  {
    "pregunta": "¿En qué consiste la técnica del 'smurfing' o 'pitufeo' como método de lavado de dinero?",
    "opciones": [
      "La apertura de múltiples cuentas bancarias en diferentes instituciones financieras a nombre de una sola persona",
      "El uso de empresas fantasma para crear capas de opacidad sobre el origen de los fondos ilícitos",
      "El uso de múltiples personas ('pitufos') para realizar numerosos depósitos pequeños dispersando el dinero y evitando los umbrales de reporte",
      "La conversión de efectivo en instrumentos negociables como cheques de caja o giros bancarios"
    ],
    "respuesta_correcta": 2,
    "explicacion": "El smurfing o pitufeo emplea múltiples personas ('pitufos') para realizar numerosos depósitos de efectivo en pequeñas cantidades en distintas sucursales o instituciones. El objetivo es que ningún depósito individual supere el umbral de reporte. Los sistemas de monitoreo deben detectar este patrón mediante el análisis de transacciones vinculadas por monto total, temporalidad y beneficiario.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Tipologías de LD; GAFI - Métodos y Tendencias"
  },
  {
    "pregunta": "¿Cuál es la distinción clave entre una 'señal de alerta' y una 'operación sospechosa'?",
    "opciones": [
      "No existe distinción; ambos términos son equivalentes en la práctica operativa de los bancos",
      "La señal de alerta siempre implica un reporte obligatorio inmediato, mientras que la sospechosa solo requiere documentación",
      "La señal de alerta aplica exclusivamente a personas físicas, y la operación sospechosa a personas morales",
      "La señal de alerta es un indicador que activa el análisis; la operación sospechosa es el resultado del análisis que determina la presunta vinculación con LD/FT y genera la obligación de presentar un ROS"
    ],
    "respuesta_correcta": 3,
    "explicacion": "La señal de alerta (red flag) es el indicador que activa el proceso de investigación interna. Tras el análisis, si la entidad concluye que existen elementos razonables para presumir vinculación con LD/FT, la operación se clasifica como sospechosa y genera la obligación de presentar un Reporte de Operación Sospechosa (ROS). La señal es el disparador; la sospecha es la conclusión del análisis.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Operaciones Inusuales y Sospechosas; Guía CNBV"
  },
  {
    "pregunta": "¿Por qué el 'uso inusual de efectivo' constituye una señal de alerta prioritaria en PLD/FT?",
    "opciones": [
      "Porque el efectivo es anónimo, difícil de rastrear y es el principal medio utilizado en la etapa de colocación del lavado de dinero; montos elevados o inconsistentes con la actividad del cliente generan sospecha",
      "Porque las operaciones en efectivo están totalmente prohibidas para personas morales bajo la LFPIORPI",
      "Porque el efectivo solo puede depositarse en cuentas personales, no en cuentas empresariales",
      "Porque los billetes de alta denominación están fuera de circulación legal en el territorio mexicano"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El efectivo es el instrumento preferido en la etapa de colocación del LD porque es anónimo y difícil de rastrear en su origen. Montos elevados de efectivo inconsistentes con el giro del negocio, depósitos frecuentes en billetes de alta denominación o en mal estado, o cambios bruscos en los volúmenes de efectivo manejados son señales de alerta que deben activar el monitoreo conforme a la Guía CNBV.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Señales de Alerta; GAFI - Tipologías de Colocación"
  },
  {
    "pregunta": "¿Qué señal de alerta representa un cliente que no puede explicar coherentemente el origen de sus fondos?",
    "opciones": [
      "Es indicativo de un problema administrativo del cliente, no necesariamente un indicio de LD/FT",
      "Es una señal de alerta significativa que sugiere que los recursos podrían provenir de actividades ilícitas, y activa la obligación de análisis adicional y posiblemente la negativa de continuar la relación",
      "Es un comportamiento normal que no debe generar ningún tipo de alerta ni seguimiento adicional",
      "Solo es relevante como señal de alerta si el cliente es una persona políticamente expuesta (PEP)"
    ],
    "respuesta_correcta": 1,
    "explicacion": "La incapacidad de justificar el origen de los recursos es una de las señales de alerta más directas en PLD/FT. Las entidades tienen la obligación de conocer el origen de los fondos de sus clientes. Cuando el cliente no puede o no quiere proporcionar una explicación coherente y verificable, la entidad debe profundizar el análisis y, si persiste la duda, presentar un ROS o abstenerse de realizar la operación.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Señales de Alerta; GAFI Rec. 10"
  },
  {
    "pregunta": "¿Qué es la 'estratificación' en el lavado de dinero y cuáles son sus señales características?",
    "opciones": [
      "La primera etapa del lavado donde el efectivo se introduce al sistema financiero mediante depósitos",
      "La última etapa del lavado donde los fondos se reintegran a la economía con apariencia lícita",
      "La segunda etapa del LD donde se realizan múltiples transacciones complejas para obscurecer el rastro; sus señales incluyen transferencias frecuentes entre cuentas, conversiones de divisas sin justificación económica y uso de múltiples jurisdicciones",
      "El proceso de diversificación de inversiones en instrumentos financieros sin propósito ilícito"
    ],
    "respuesta_correcta": 2,
    "explicacion": "La estratificación o diversificación es la segunda etapa del LD, donde el objetivo es crear múltiples capas de transacciones para separar los fondos de su origen ilícito y dificultar el rastreo. Sus señales incluyen: transferencias en cadena entre múltiples cuentas, conversiones frecuentes de divisas sin propósito comercial, uso de instrumentos complejos, y operaciones con múltiples jurisdicciones sin justificación aparente.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "GAFI - Etapas del LD; Guía CNBV - Tipologías de Estratificación"
  },
  {
    "pregunta": "¿Qué es una 'cuenta mula' y por qué representa una señal de alerta en el sistema financiero?",
    "opciones": [
      "Una cuenta con saldo mínimo mantenida activa únicamente para evitar comisiones por inactividad",
      "Una cuenta de inversión de alto rendimiento con restricciones de retiro por plazo forzoso",
      "Una cuenta mancomunada entre varias personas físicas para realizar pagos colectivos",
      "Una cuenta cuyo titular recibe fondos de terceros y los transfiere de inmediato, siendo utilizado como intermediario para mover dinero ilícito; el patrón de recibir y transferir rápidamente sin retener saldo es la señal clave"
    ],
    "respuesta_correcta": 3,
    "explicacion": "La cuenta mula es aquella cuyo titular (generalmente captado mediante engaño o con participación consciente) recibe fondos y los transfiere rápidamente, sin retenerlos. El patrón característico es: recepción de fondos de múltiples orígenes seguida de transferencia inmediata, sin actividad comercial que justifique los flujos. Es una herramienta clave en la estratificación del LD.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Tipologías LD; GAFI - Vulnerabilidades en Banca Minorista"
  },
  {
    "pregunta": "¿Qué patrón de riesgo representan los 'negocios intensivos en efectivo' en la detección de LD?",
    "opciones": [
      "Representan un riesgo elevado porque permiten mezclar fondos ilícitos con ingresos legítimos difíciles de verificar de forma independiente, como lavanderías, estacionamientos, restaurantes y tiendas minoristas",
      "Son negocios de bajo riesgo porque sus ingresos son pequeños y fácilmente verificables por las autoridades fiscales",
      "Solo representan riesgo si el propietario ha sido previamente investigado por delitos financieros",
      "Son negocios de riesgo únicamente en la etapa de integración del lavado de dinero"
    ],
    "respuesta_correcta": 0,
    "explicacion": "Los negocios que manejan grandes volúmenes de efectivo (lavanderías, estacionamientos, restaurantes, carwashes, peluquerías) son especialmente vulnerables al LD porque permiten inflar los ingresos declarados mezclando dinero ilícito con ingresos legítimos. Es muy difícil verificar de manera independiente el flujo real de clientes y transacciones, lo que los convierte en vehículos ideales para la etapa de colocación e integración.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Sectores de Alto Riesgo; GAFI - Negocios Intensivos en Efectivo"
  },
  {
    "pregunta": "¿Qué señal de alerta representa una empresa recién constituida que realiza inmediatamente operaciones de alto valor?",
    "opciones": [
      "Es una señal positiva de un negocio dinámico con cartera de clientes establecida desde el inicio",
      "Es una señal de alerta porque las empresas legítimas generalmente tienen un crecimiento gradual; una empresa nueva con operaciones de alto valor desde el inicio puede ser una empresa de fachada usada para estratificación o integración",
      "Es irrelevante desde la perspectiva PLD/FT; solo importa el tipo de actividad, no la antigüedad de la empresa",
      "Solo es una señal de alerta si la empresa opera específicamente en el sector financiero o inmobiliario"
    ],
    "respuesta_correcta": 1,
    "explicacion": "Una empresa legítima normalmente requiere tiempo para establecer relaciones comerciales y generar volumen de negocio. Una empresa de reciente constitución que desde sus primeras semanas realiza operaciones de alto valor, especialmente en efectivo o con múltiples contrapartes sin relación aparente, es una señal de alerta que sugiere su posible uso como empresa de fachada para estratificación o integración de fondos ilícitos.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Señales de Alerta Personas Morales; GAFI - Empresas de Fachada"
  },
  {
    "pregunta": "¿Qué son los 'testaferros' o 'prestanombres' y cómo se utilizan en el lavado de dinero?",
    "opciones": [
      "Son representantes legales que actúan en nombre de empresas extranjeras con operaciones en México",
      "Son intermediarios financieros autorizados por la CNBV para actuar en nombre de sus clientes en operaciones específicas",
      "Son personas que prestan su nombre e identidad para figurar como propietarios o titulares de activos o cuentas que en realidad pertenecen o son controlados por terceros, ocultando la identidad del verdadero beneficiario",
      "Son notarios públicos que dan fe de la identidad de los signatarios en contratos financieros de alto valor"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Los testaferros o prestanombres son personas que permiten que su identidad sea usada para registrar activos, cuentas bancarias o empresas que en realidad son controladas por terceros (generalmente vinculados a actividades ilícitas). Su detección requiere identificar al beneficiario controlador real detrás de la figura nominal, que es una obligación central del KYC conforme a las Disposiciones de la CNBV y el GAFI Rec. 24.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "GAFI Rec. 24; Guía CNBV - Beneficiario Controlador y Testaferros"
  },
  {
    "pregunta": "¿Qué señal de alerta representa el 'cambio frecuente de forma de pago' sin justificación aparente?",
    "opciones": [
      "Es una práctica normal de diversificación financiera sin implicaciones de LD/FT",
      "Es irrelevante como señal de alerta siempre que los montos individuales sean pequeños",
      "Solo es una señal de alerta cuando involucra transferencias internacionales a jurisdicciones de riesgo",
      "Puede indicar intentos de obscurecer el rastro de los fondos, especialmente si el cliente alterna sin justificación entre efectivo, cheques, transferencias y otros instrumentos, dificultando el seguimiento de los recursos"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Cambiar de forma de pago frecuentemente y sin una razón comercial lógica puede ser un intento de crear confusión en el rastro de los fondos. Este patrón, combinado con otros indicadores como montos inusuales o contrapartes en jurisdicciones de riesgo, constituye una señal de alerta relevante que debe ser analizada en el contexto del perfil transaccional del cliente.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Señales de Alerta; Disposiciones de Carácter General CNBV - Monitoreo"
  },
  {
    "pregunta": "¿Cuáles son las señales de alerta características de la etapa de 'colocación' del lavado de dinero?",
    "opciones": [
      "Grandes depósitos de efectivo sin justificación económica, múltiples depósitos en diferentes sucursales el mismo día, compra de instrumentos negociables con efectivo, y depósitos con billetes en mal estado o de alta denominación",
      "Transferencias internacionales de alto valor y uso de bancos corresponsales en paraísos fiscales",
      "Adquisición de propiedades de lujo a precio de mercado con fondos aparentemente documentados",
      "Constitución de empresas holdings con múltiples capas de subsidiarias en diferentes jurisdicciones"
    ],
    "respuesta_correcta": 0,
    "explicacion": "La etapa de colocación es donde el dinero ilícito (generalmente efectivo) se introduce al sistema financiero. Las señales incluyen: depósitos de efectivo de alto valor o frecuentes sin justificación, múltiples depósitos por debajo del umbral en diferentes sucursales o días consecutivos, compra de cheques de caja, money orders o instrumentos negociables con efectivo, y uso de billetes de alta denominación o en mal estado.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "GAFI - Etapas LD Colocación; Guía CNBV - Señales de Alerta por Etapa"
  },
  {
    "pregunta": "¿Qué señal de alerta representa la apertura de múltiples cuentas por una misma persona o grupo vinculado?",
    "opciones": [
      "Es una práctica normal de diversificación financiera sin relevancia para la identificación de LD/FT",
      "Puede indicar intentos de fragmentar fondos entre diferentes cuentas para dificultar el rastreo, especialmente si las cuentas reciben fondos simultáneos o se utilizan para transferencias rápidas entre ellas",
      "Solo es una señal de alerta si las cuentas están registradas en diferentes instituciones financieras",
      "Es una señal de alerta únicamente si el titular principal es una persona políticamente expuesta"
    ],
    "respuesta_correcta": 1,
    "explicacion": "La apertura de múltiples cuentas por el mismo titular o por personas vinculadas (familiares, socios) puede indicar un intento de fragmentar el dinero para evadir umbrales de reporte, o para crear múltiples puntos de entrada y salida de fondos. Este patrón debe analizarse en conjunto con los flujos entre las cuentas, los montos y la actividad económica declarada del cliente.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Señales de Alerta; Disposiciones de Carácter General CNBV - Monitoreo Transaccional"
  },
  {
    "pregunta": "Caso práctico: Un cliente realiza 9 depósitos en efectivo de $9,500 pesos cada uno durante la misma semana en sucursales diferentes. ¿Qué patrón de riesgo refleja esta situación?",
    "opciones": [
      "Es una práctica comercial normal de un empresario que gestiona manualmente su flujo de efectivo",
      "Refleja un problema logístico del cliente que no ha podido consolidar un depósito único mayor",
      "Refleja el patrón clásico de estructuración: depósitos deliberadamente bajo el umbral de reporte, en múltiples sucursales para evitar la detección; es una señal de alerta grave que requiere análisis y posiblemente un ROS",
      "Es una operación relevante automática porque la suma semanal supera el equivalente a USD 10,000"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Este caso es el patrón textbook de estructuración o smurfing: múltiples depósitos por debajo del umbral de USD 10,000 (o su equivalente), realizados en distintas sucursales para evadir el reporte como Operación Relevante. Los sistemas de monitoreo deben vincular estas operaciones y analizarlas en conjunto. La suma total y el patrón de conducta deliberada justifican el inicio de un análisis de operación inusual y posiblemente un ROS.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "Guía CNBV - Estructuración; Disposiciones de Carácter General CNBV - Operaciones Vinculadas"
  },
  {
    "pregunta": "¿Qué patrón de riesgo PLD/FT representan las 'empresas de fachada' (shell companies)?",
    "opciones": [
      "Son estructuras de bajo riesgo porque están debidamente registradas ante las autoridades fiscales y mercantiles",
      "Solo representan riesgo si están registradas en el extranjero; las nacionales siempre son de bajo riesgo",
      "Son estructuras de riesgo elevado únicamente cuando operan en el sector financiero regulado",
      "Representan alto riesgo porque son empresas con apariencia legal pero sin actividad económica real, usadas para crear opacidad sobre el origen de los fondos, dificultar la identificación del beneficiario controlador y mover dinero entre jurisdicciones"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Las empresas de fachada son vehículos clave en la estratificación e integración del LD. Sus señales características incluyen: domicilio fiscal que no corresponde a actividad comercial real, ausencia de empleados o activos tangibles, alta dirección con múltiples empresas a su nombre, operaciones que no corresponden con el giro declarado, y estructuras de propiedad opacas con beneficiario controlador difícil de identificar.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI - Empresas de Fachada y Estructuras Opacas; Guía CNBV - Personas Morales de Alto Riesgo"
  },
  {
    "pregunta": "¿Qué señales de alerta son características de operaciones sospechosas en el sector inmobiliario?",
    "opciones": [
      "Compraventas con precio significativamente distinto al valor de mercado, pago en efectivo o fraccionado sin justificación, uso de intermediarios innecesarios, y múltiples cambios de comprador antes del registro definitivo",
      "El uso de créditos hipotecarios bancarios con tasa fija a largo plazo respaldados por avalúo",
      "La adquisición de propiedades en zonas turísticas o de alta plusvalía en desarrollo",
      "La compraventa de inmuebles formalizadas ante notario público con escritura debidamente inscrita"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El sector inmobiliario es un vehículo clásico de integración del LD. Las señales incluyen: precios de compraventa significativamente sobre o bajo el valor de mercado (para justificar entradas de efectivo ilícito o extraer valor), pagos en efectivo o fragmentados sin justificación, uso de intermediarios en jurisdicciones opacas, comprador que desconoce detalles del inmueble, y cambios de comprador (flipping) antes del registro definitivo.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI - Vulnerabilidades Sector Inmobiliario; Guía CNBV - Señales de Alerta Inmobiliario"
  },
  {
    "pregunta": "¿Qué patrones de alerta están asociados con el 'comercio internacional' como mecanismo de lavado de dinero?",
    "opciones": [
      "Las exportaciones de productos manufacturados a países con tratados de libre comercio vigentes con México",
      "Facturas con precios sobre o sub-valuados respecto al mercado, descripción imprecisa de mercancías, pagos o cobros anticipados sin entrega de bienes, y uso de intermediarios comerciales en jurisdicciones opacas",
      "La importación de maquinaria industrial bajo regímenes aduaneros temporales debidamente autorizados",
      "Las operaciones con cartas de crédito documentario respaldadas por bancos de primer orden internacional"
    ],
    "respuesta_correcta": 1,
    "explicacion": "El Trade-Based Money Laundering (TBML) usa el comercio internacional para mover valor ilícito. Sus señales incluyen: sub o sobre-facturación de bienes y servicios (para justificar pagos al exterior o recibir fondos sin equivalente comercial real), descripciones genéricas o imprecisas de mercancías, pagos que no corresponden con los volúmenes declarados, y uso de intermediarios sin justificación comercial en jurisdicciones de baja transparencia.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI - Trade-Based Money Laundering (TBML); Guía CNBV - Comercio Internacional"
  },
  {
    "pregunta": "Caso práctico: Un cliente declara operar un estacionamiento de 50 lugares y deposita $500,000 en efectivo mensualmente. ¿Qué análisis PLD/FT debe realizarse?",
    "opciones": [
      "Ninguno; los depósitos de negocios registrados ante el SAT con RFC activo no generan obligación de análisis adicional",
      "Solo verificar que el cliente tenga RFC activo y comprobante de arrendamiento del local comercial",
      "Verificar la consistencia del ingreso declarado con la capacidad operativa real del negocio: con 50 lugares, el ingreso máximo estimable puede ser significativamente menor al declarado; la inconsistencia es una señal de alerta que justifica análisis profundo y potencialmente un ROS",
      "El monto mensual supera automáticamente el umbral de reporte y se registra sin análisis adicional"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Este caso ilustra la técnica de inflación de ingresos de negocios intensivos en efectivo: un estacionamiento de 50 lugares con ocupación máxima durante 24 horas y tarifa promedio difícilmente alcanza $500,000 mensuales. La inconsistencia entre la capacidad operativa real y los depósitos declarados es una señal de alerta crítica que sugiere que el negocio se usa para 'blanquear' fondos mezclando efectivo ilícito con ingresos reales.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "Guía CNBV - Negocios Intensivos en Efectivo; GAFI - Tipologías Comercios de Fachada"
  },
  {
    "pregunta": "¿Qué señales de alerta caracterizan el lavado de dinero a través de casinos o establecimientos de juego?",
    "opciones": [
      "El uso frecuente de fichas de bajo valor y la preferencia declarada por juegos de mesa",
      "La solicitud de crédito directo al casino para financiar las apuestas del jugador habitual",
      "La participación en torneos de juego con premios menores a $5,000 pesos",
      "Compra de fichas con efectivo seguida de cobro inmediato por cheque, solicitud de comprobante de ganancias sin registro de pérdidas, y múltiples personas que compran y transfieren fichas al mismo individuo"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Los casinos son utilizados clásicamente para el LD mediante técnicas como: comprar fichas con efectivo ilícito y solicitar el reintegro mediante cheque (para obtener un instrumento financiero con apariencia lícita), intercambiar fichas entre múltiples personas para oscurecer la trayectoria, y obtener comprobantes de 'ganancias' que no reflejan la actividad real. La LFPIORPI lista a los casinos como actividades vulnerables por estos riesgos.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "LFPIORPI Art. 17 Fracc. IX; Guía CNBV - Casinos y Juegos de Azar; GAFI"
  },
  {
    "pregunta": "¿Qué es el 'loan-back' como técnica de lavado de dinero y cómo se detecta?",
    "opciones": [
      "Técnica donde el lavador deposita dinero ilícito en el extranjero y obtiene un 'préstamo' de esa misma entidad, logrando que los fondos regresen como ingresos aparentemente lícitos (intereses deducibles, capital recibido con documentación formal)",
      "Una técnica de inversión donde el cliente usa préstamos bancarios para especular en mercados financieros de alto riesgo",
      "Un fraude bancario donde el cliente obtiene créditos con documentación falsa para obtener liquidez inmediata",
      "Una estrategia de financiamiento donde los accionistas de una empresa se prestan recursos entre ellos sin intereses"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El loan-back es una técnica de integración: el lavador deposita dinero ilícito en una institución financiera (generalmente offshore) o empresa controlada, y luego recibe ese mismo dinero en forma de 'préstamo' documentado. El préstamo se paga con el dinero original, generando además la apariencia de gastos por intereses deducibles fiscalmente. Sus señales: préstamos de entidades en paraísos fiscales sin actividad comercial real y condiciones inusuales.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI - Tipologías de Integración; Guía CNBV - Técnicas de Lavado Avanzadas"
  },
  {
    "pregunta": "¿Qué señales de alerta están asociadas con el uso de criptomonedas o activos virtuales en el lavado de dinero?",
    "opciones": [
      "El simple uso de criptomonedas es suficiente para generar un reporte automático a las autoridades competentes",
      "Conversiones frecuentes entre criptomonedas y moneda fiat sin propósito comercial claro, uso de mezcladoras o mixers, transacciones a carteras en jurisdicciones de alto riesgo, y discrepancia entre el perfil del cliente y el volumen o sofisticación de las operaciones",
      "Las criptomonedas representan bajo riesgo porque su trazabilidad en blockchain elimina el anonimato",
      "Solo generan señal de alerta si cada transacción individual supera el equivalente a USD 10,000"
    ],
    "respuesta_correcta": 1,
    "explicacion": "Las criptomonedas presentan riesgos PLD/FT por su pseudoanonimato y operación transfronteriza. Señales de alerta incluyen: conversiones frecuentes cripto-fiat sin propósito aparente, uso de servicios de mezcla (tumblers/mixers) que obscurecen la trayectoria de los fondos, transacciones hacia exchanges o carteras en jurisdicciones de alto riesgo, y actividades de trading que no corresponden al perfil del cliente. El GAFI Rec. 15 aplica a activos virtuales.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 15 - Activos Virtuales; Guía CNBV - Riesgos Emergentes"
  },
  {
    "pregunta": "¿Qué patrones de alerta sugieren el uso de personas morales como vehículo de lavado de dinero?",
    "opciones": [
      "La participación de la empresa en más de dos sectores económicos distintos de manera simultánea",
      "Tener registro ante el SAT y cumplir con obligaciones fiscales formales de manera puntual",
      "Estructura accionaria con múltiples capas sin justificación económica, beneficiario controlador difícil de identificar, actividad declarada inconsistente con las operaciones, domicilio fiscal en dirección sin actividad comercial, y cambios frecuentes de representante legal o razón social",
      "La empresa mantiene subsidiarias en diferentes estados de la República Mexicana"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Las personas morales utilizadas como vehículo de LD presentan señales como: estructura de propiedad con múltiples capas sin lógica empresarial, imposibilidad de identificar al beneficiario controlador real, actividad económica declarada inconsistente con sus operaciones bancarias reales, domicilio registrado en dirección sin actividad real (buzón), y cambios frecuentes de representante legal, denominación social o giro, que buscan dificultar el rastreo.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 24; Guía CNBV - Señales de Alerta Personas Morales"
  },
  {
    "pregunta": "Caso práctico: Un funcionario público (PEP) realiza transferencias periódicas de $300,000 a cuentas en dos países catalogados como paraísos fiscales, sin documentación comercial. ¿Qué debe hacer la institución?",
    "opciones": [
      "Aceptar las transferencias sin análisis; los funcionarios públicos tienen derecho a la privacidad de sus operaciones financieras",
      "Solo registrar las operaciones como relevantes sin análisis adicional porque los montos individuales no superan cierto umbral",
      "Notificar al cliente que sus operaciones están siendo analizadas para darle oportunidad de explicar antes de cualquier reporte",
      "Aplicar Debida Diligencia Reforzada para PEPs, solicitar justificación documentada del origen y propósito de las transferencias, elevar el análisis al nivel directivo, y si no existe justificación razonable, presentar un ROS sin notificar al cliente"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Los PEPs requieren Debida Diligencia Reforzada conforme al GAFI Rec. 12 y las Disposiciones de la CNBV. Transferencias periódicas a paraísos fiscales sin justificación comercial son una señal de alerta grave, especialmente en PEPs donde el riesgo de corrupción es elevado. La institución debe solicitar documentación (sin notificar el análisis PLD) y, de no obtenerse justificación satisfactoria, presentar el ROS de inmediato.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 12; Disposiciones de Carácter General CNBV - PEPs y Operaciones Sospechosas"
  },
  {
    "pregunta": "¿Qué es el 'lavado de dinero basado en comercio' (TBML) y cuáles son sus principales señales de alerta?",
    "opciones": [
      "Técnica que usa transacciones comerciales internacionales para mover valor ilícito; sus señales incluyen sobre o sub-facturación, descripción vaga de mercancías, pagos sin entrega de bienes verificable, intermediarios en jurisdicciones opacas y discrepancias entre volúmenes declarados y los reales",
      "El uso de tarjetas de crédito empresariales para compras de bienes de lujo en el extranjero",
      "La compraventa de divisas extranjeras entre empresas de un mismo grupo corporativo",
      "El financiamiento de importaciones mediante cartas de crédito con bancos internacionales de primer nivel"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El TBML (Trade-Based Money Laundering) es una de las técnicas más sofisticadas de LD. Usa transacciones de comercio internacional para mover valor a través de fronteras de forma aparentemente legítima. Sus señales clave son: facturas con precios significativamente distintos al valor de mercado (sobre o sub-facturación), descripciones genéricas de mercancías, pagos anticipados totales sin entrega verificable, y uso de intermediarios comerciales en centros financieros offshore sin razón comercial aparente.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI - TBML (Trade-Based Money Laundering); Guía CNBV - Comercio Exterior y LD"
  },
  {
    "pregunta": "¿Qué patrones transaccionales sugieren que un cliente puede estar en la etapa de 'integración' del lavado de dinero?",
    "opciones": [
      "Múltiples depósitos de efectivo en montos por debajo del umbral de reporte en distintas sucursales",
      "Inversión en activos reales (propiedades, negocios legítimos, obras de arte), generación de ingresos aparentemente lícitos (rentas, dividendos, plusvalías), con justificación documental elaborada que no resiste análisis profundo de coherencia económica",
      "Transferencias frecuentes entre cuentas del mismo titular en la misma institución bancaria",
      "Solicitud de créditos hipotecarios para adquisición de primera vivienda con ingresos demostrables"
    ],
    "respuesta_correcta": 1,
    "explicacion": "En la etapa de integración los fondos regresan a la economía con apariencia lícita. Los patrones incluyen: adquisición de propiedades, negocios, obras de arte o joyas sin justificación financiera sólida; creación de empresas que generan 'ingresos' difíciles de verificar independientemente; inversiones con documentación elaborada pero que presenta inconsistencias al análisis profundo. La entidad debe evaluar la coherencia económica global del cliente.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI - Etapas LD Integración; Guía CNBV - Señales de Alerta por Etapa"
  },
  {
    "pregunta": "Caso práctico: Una empresa constructora recibe pagos fraccionados de 15 personas sin aparente relación entre sí, cada una por $8,000 pesos, en el mismo día. ¿Qué señal de alerta representa?",
    "opciones": [
      "Es un patrón de ventas normal para una empresa constructora con proyectos de preventa masiva",
      "Solo requiere verificar que cada pago sea declarado fiscalmente por cada una de las personas",
      "Representa 'estructuración inversa': múltiples personas depositan montos bajo el umbral a un mismo receptor, posiblemente consolidando fondos ilícitos; requiere análisis del origen de cada pago y revisión del perfil de la empresa",
      "Es una operación relevante automática porque la suma total supera el equivalente al umbral de reporte"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Este patrón puede indicar 'estructuración inversa' o uso de la empresa como receptor de fondos fragmentados: múltiples personas no relacionadas depositan montos similares y por debajo del umbral a la misma empresa. Esto puede ser la entrada de fondos ilícitos de múltiples fuentes que se consolidan en la empresa constructora. Requiere análisis del origen de cada pago, la relación entre los pagadores y la empresa, y si el monto total es consistente con la actividad real de la constructora.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "Guía CNBV - Estructuración Inversa; Disposiciones de Carácter General CNBV - Monitoreo"
  },
  {
    "pregunta": "¿Qué señales de alerta son características en operaciones de casas de cambio relacionadas con lavado de dinero?",
    "opciones": [
      "La conversión de pesos a dólares en montos menores a $5,000 por operación individual",
      "Las operaciones de remesas enviadas a países con alto volumen de emigración mexicana",
      "El uso frecuente del servicio por turistas extranjeros durante temporadas vacacionales",
      "Clientes que cambian grandes cantidades de efectivo en billetes pequeños a grandes denominaciones o divisas extranjeras, operaciones fragmentadas por múltiples personas el mismo día, y clientes que no pueden justificar el origen de montos elevados"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Las casas de cambio son vulnerables al LD porque manejan efectivo y facilitan la conversión entre monedas. Señales de alerta: cambio de billetes de baja a alta denominación sin propósito aparente, múltiples personas que realizan cambios similares de manera coordinada el mismo día (smurfing de divisas), clientes que no justifican el origen de montos elevados de efectivo, y operaciones inconsistentes con el perfil del cliente o su lugar de residencia.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "LFPIORPI Art. 17; Guía CNBV - Casas de Cambio; GAFI - Vulnerabilidades Cambio de Divisas"
  },
  {
    "pregunta": "¿Qué características diferencian los patrones del 'financiamiento al terrorismo' (FT) de los del lavado de dinero tradicional?",
    "opciones": [
      "El FT puede involucrar montos pequeños provenientes de fuentes lícitas sin necesidad de ocultar el origen; busca ocultar el destino de los fondos; sus señales incluyen transferencias a zonas de conflicto, donaciones a entidades no verificables, y gasto austero combinado con envíos al exterior",
      "El FT siempre involucra montos superiores a USD 1 millón, lo que lo diferencia claramente del LD de pequeña escala",
      "El FT ocurre exclusivamente en efectivo; las transferencias bancarias son exclusivas del lavado de dinero convencional",
      "No existen diferencias de patrones detectables; el FT y el LD son operativamente indistinguibles desde el monitoreo bancario"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El FT difiere del LD en su lógica: el LD busca ocultar el origen ilícito de los fondos; el FT puede usar fondos de origen lícito (donaciones, salarios, ahorros) y busca ocultar el destino para financiar actividades terroristas. El FT generalmente involucra montos menores, patrón de gasto personal austero con envíos sistemáticos al exterior, transferencias a individuos o entidades en zonas de conflicto, y donaciones a organizaciones no verificables.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 5 y 6; Guía CNBV - Financiamiento al Terrorismo; LFPIORPI Art. 2"
  },
  {
    "pregunta": "¿Qué es el 'layering' mediante banca privada y cuáles son sus señales de alerta?",
    "opciones": [
      "Es la práctica de diversificar inversiones de clientes de alto patrimonio entre múltiples clases de activos financieros",
      "Es el uso de cuentas de banca privada para realizar múltiples transferencias en cadena entre jurisdicciones, conversiones sucesivas de divisas e inversiones en vehículos complejos y fideicomisos offshore, con el propósito de obscurecer el origen; señales: movimientos frecuentes sin objetivo de inversión claro y resistencia a documentar",
      "Es el proceso de calificación de clientes de alto patrimonio para acceder a productos exclusivos de inversión estructurada",
      "Es la técnica de incrementar gradualmente los montos depositados para no superar en ningún momento los umbrales de reporte"
    ],
    "respuesta_correcta": 1,
    "explicacion": "La banca privada, por su discreción y la complejidad de sus productos, es especialmente vulnerable al layering. Las señales incluyen: múltiples transferencias entre cuentas en diferentes países sin lógica de inversión, conversiones de divisas frecuentes y sin propósito aparente, uso de fideicomisos offshore o vehículos de inversión opacos, y resistencia del cliente a proporcionar información sobre el origen de los fondos o el propósito de las transacciones.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI - Vulnerabilidades Banca Privada; Guía CNBV - Estratificación Avanzada"
  },
  {
    "pregunta": "Caso práctico: Un cliente solicita con urgencia una transferencia de $200,000 a una cuenta en un país en la lista gris del GAFI, argumentando un negocio con un proveedor. ¿Cuál es la respuesta correcta de la institución?",
    "opciones": [
      "Procesar la transferencia de inmediato; el cliente tiene libertad de mover sus fondos a cualquier país",
      "Rechazar automáticamente la transferencia sin análisis porque el destino está en lista gris del GAFI",
      "Aplicar Debida Diligencia Reforzada: solicitar documentación que acredite la relación comercial (contrato, factura, datos del proveedor), verificar coherencia con el perfil del cliente, consultar listas de sancionados, y si la documentación no es satisfactoria, abstenerse de realizar la operación y analizar si procede un ROS",
      "Notificar automáticamente a la UIF porque toda transferencia a un país de lista gris del GAFI genera reporte obligatorio sin análisis previo"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Las jurisdicciones en la lista gris del GAFI requieren Debida Diligencia Reforzada conforme al GAFI Rec. 19 y las Disposiciones de la CNBV. La institución no debe rechazar ni procesar automáticamente: debe solicitar documentación que acredite la relación comercial, verificar que sea consistente con el perfil del cliente, hacer screening de la contraparte, y evaluar la urgencia (que por sí sola es una señal de alerta). De no obtenerse justificación adecuada, procede abstenerse y evaluar el ROS.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 19; Disposiciones de Carácter General CNBV - Jurisdicciones de Riesgo y ROS"
  },
  {
    "pregunta": "¿Cómo se analiza un caso complejo de LD con múltiples personas morales anidadas para identificar al beneficiario controlador y determinar si procede un reporte?",
    "opciones": [
      "Solo es necesario identificar a la empresa que directamente mantiene la cuenta, sin explorar capas adicionales",
      "El análisis se limita a verificar que todas las empresas estén registradas ante el SAT y cumplan obligaciones fiscales",
      "Es suficiente con obtener el acta constitutiva de la empresa que opera directamente las cuentas bancarias",
      "Requiere desagregar cada capa hasta identificar la persona física con control real: revisar accionistas por nivel, poderes, quién da instrucciones operativas, comparar con bases de datos internacionales, y si la estructura carece de justificación económica razonable, es en sí misma una señal de alerta que puede justificar un ROS"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Las estructuras corporativas anidadas (empresa A que tiene empresa B que tiene empresa C) son un mecanismo clásico de estratificación para obscurecer al beneficiario controlador. El análisis requiere: desagregar cada nivel de propiedad, identificar quién firma realmente los documentos, quién da instrucciones al banco, comparar con registros públicos y bases de datos internacionales (Pandora Papers, registros OFAC), y evaluar si la complejidad tiene una justificación económica legítima o si es artificialmente opaca.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "difícil",
    "fuente": "GAFI Rec. 24; Disposiciones de Carácter General CNBV - Beneficiario Controlador; Guía CNBV"
  },
  {
    "pregunta": "¿Cuáles son los principales indicadores de lavado de dinero en operaciones de financiamiento del comercio internacional (Trade Finance)?",
    "opciones": [
      "Discrepancias entre el valor facturado y el precio de mercado (sobre/sub-facturación), descripción imprecisa de mercancías, inconsistencia entre el tamaño del negocio y el volumen operado, uso de intermediarios en jurisdicciones opacas sin justificación comercial, múltiples enmiendas a cartas de crédito y pago anticipado sin entrega verificable",
      "Solo el incumplimiento de los plazos de pago acordados en los contratos de compraventa internacional",
      "El uso de seguros de crédito a la exportación con respaldo de organismos gubernamentales mexicanos",
      "La participación de bancos corresponsales autorizados en la liquidación de operaciones de comercio exterior"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El Trade Finance es especialmente vulnerable al TBML porque las transacciones comerciales son complejas y difíciles de verificar de manera independiente. Los indicadores clave incluyen: precios que no corresponden con valores de mercado verificables, descripciones de mercancías genéricas o imprecisas, volumen de operaciones inconsistente con el tamaño real del negocio, múltiples enmiendas a instrumentos de pago sin justificación, y contraparte ubicada en jurisdicción opaca sin relación comercial históricamente verificable.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "difícil",
    "fuente": "GAFI - TBML (Trade-Based Money Laundering) 2006 y actualización; Guía CNBV - Comercio Internacional"
  },
  {
    "pregunta": "¿Qué elementos permiten distinguir el 'financiamiento al terrorismo' del 'lavado de dinero' al analizar operaciones sospechosas desde la perspectiva del oficial de cumplimiento?",
    "opciones": [
      "No es posible distinguirlos operativamente; ambos se reportan con el mismo formulario ROS sin diferenciación",
      "El LD oculta el origen ilícito de fondos; el FT puede usar fondos de origen lícito y oculta el destino; el FT involucra frecuentemente montos pequeños con envíos sistemáticos, beneficiarios en zonas de conflicto o en listas de sancionados, y puede provenir de donaciones o negocios aparentemente legítimos",
      "La distinción entre FT y LD solo puede realizarla la autoridad judicial, no el oficial de cumplimiento de una entidad financiera",
      "El FT siempre involucra transferencias internacionales de alto valor; el LD siempre se limita a operaciones domésticas en efectivo"
    ],
    "respuesta_correcta": 1,
    "explicacion": "La distinción operativa es fundamental para un reporte adecuado: el LD parte de fondos ilícitos que buscan legitimarse (el problema está en el origen); el FT puede partir de fondos lícitos (donaciones, sueldos, ahorros) que se destinan a financiar terrorismo (el problema está en el destino). Para el oficial de cumplimiento, las señales del FT incluyen: transferencias sistemáticas de montos pequeños a zonas de conflicto, beneficiarios en listas de sancionados por terrorismo, y patrones de vida austero combinados con envíos regulares al exterior.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "difícil",
    "fuente": "GAFI Rec. 5 y 6; Guía CNBV - FT vs. LD; LFPIORPI Art. 2 Fracc. IX"
  },
  {
    "pregunta": "¿Cómo distinguir entre 'evasión fiscal' y 'lavado de dinero' al analizar una operación sospechosa, y qué implicaciones tiene para el deber de reporte?",
    "opciones": [
      "La evasión fiscal nunca genera obligación de reporte PLD/FT porque es un delito tributario, no financiero",
      "Son delitos excluyentes; si se detecta evasión fiscal, el caso debe transferirse exclusivamente al SAT sin reporte PLD/FT",
      "La evasión fiscal puede constituir un delito precedente del LD: los recursos producto de la evasión son de procedencia ilícita y su manejo posterior puede configurar LD; ante indicios de evasión con patrones de LD adicionales, la entidad debe presentar el ROS; ambos delitos pueden coexistir",
      "Son delitos idénticos para efectos de reporte PLD/FT; cualquier irregularidad fiscal genera automáticamente un ROS obligatorio"
    ],
    "respuesta_correcta": 2,
    "explicacion": "La evasión fiscal es reconocida como delito precedente del lavado de dinero tanto en el CPF como por el GAFI. Los recursos que no han sido declarados al SAT son de procedencia ilícita y su depósito, conversión o transferencia posterior puede constituir LD. Cuando la entidad detecta señales que sugieren tanto evasión como patrones de LD (fragmentación, uso de testaferros, empresas de fachada), el ROS es procedente. La entidad no tiene la obligación de determinar con certeza el delito, sino de reportar cuando existan indicios razonables.",
    "tema": "Identificación de Operaciones Sospechosas",
    "dificultad": "difícil",
    "fuente": "CPF Art. 400 Bis; GAFI - Delitos Precedentes; Guía CNBV - Evasión Fiscal y LD"
  }
];
