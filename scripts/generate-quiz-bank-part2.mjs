export const quizPart2 = [
  {
    "pregunta": "¿Qué documentos de identificación se solicitan como mínimo a una persona física en el proceso KYC?",
    "opciones": [
      "Identificación oficial vigente con fotografía (INE/pasaporte), CURP y comprobante de domicilio",
      "Solo firma autógrafa y número de teléfono celular",
      "Exclusivamente el RFC expedido por el SAT",
      "Estados de cuenta bancarios de los últimos tres meses"
    ],
    "respuesta_correcta": 0,
    "explicacion": "Las Disposiciones de Carácter General de la CNBV establecen que la identificación mínima para personas físicas incluye: identificación oficial vigente con fotografía (INE, pasaporte o cédula profesional), CURP y comprobante de domicilio con antigüedad no mayor a tres meses. Estos documentos forman la base del expediente KYC.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Identificación de Clientes Personas Físicas"
  },
  {
    "pregunta": "¿Qué es el proceso de 'onboarding' de clientes en el contexto PLD/FT de una entidad financiera?",
    "opciones": [
      "El proceso de inducción y capacitación de nuevos empleados de la institución",
      "El conjunto de procedimientos para incorporar a un nuevo cliente, incluyendo su identificación, verificación, clasificación de riesgo y apertura formal de la relación comercial",
      "La migración tecnológica de sistemas de cumplimiento a plataformas digitales",
      "El proceso de alta de nuevos proveedores y contratistas de la institución"
    ],
    "respuesta_correcta": 1,
    "explicacion": "El onboarding en PLD/FT comprende los pasos para incorporar a un nuevo cliente: recolección y verificación de documentos de identidad, consulta de listas de sancionados, asignación de nivel de riesgo inicial, y apertura formal de la relación comercial. Es el punto de partida del ciclo KYC y debe documentarse conforme a las Disposiciones de la CNBV.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Proceso de Identificación; GAFI Rec. 10"
  },
  {
    "pregunta": "¿Qué información básica debe obtenerse de un cliente en la etapa de identificación del KYC?",
    "opciones": [
      "Solo nombre completo y número de cuenta asignado por el sistema",
      "Exclusivamente datos financieros: ingresos mensuales y patrimonio total declarado",
      "Nombre o denominación social, domicilio, actividad u ocupación, RFC o CURP, y declaración sobre el origen de los recursos",
      "Solo los datos que el cliente voluntariamente decida proporcionar"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Las Disposiciones de Carácter General de la CNBV establecen que la identificación del cliente debe incluir al menos: nombre completo o denominación social, domicilio, actividad u ocupación, RFC o CURP para personas físicas, y la declaración sobre el origen y destino habitual de los recursos. Sin esta información no puede abrirse la relación comercial.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Datos Mínimos de Identificación; LFPIORPI Art. 18"
  },
  {
    "pregunta": "¿Cuál es el principio fundamental que rige la identificación de clientes en las instituciones de crédito?",
    "opciones": [
      "Las instituciones pueden aceptar clientes anónimos siempre que operen por montos menores a $10,000 MXN",
      "La identificación es opcional para clientes con antigüedad mayor a cinco años",
      "Es suficiente la identificación verbal sin necesidad de documentación física",
      "Ninguna cuenta o relación comercial puede establecerse sin la plena identificación del cliente; están prohibidas las cuentas anónimas o bajo nombres ficticios"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Un principio cardinal del sistema PLD/FT es la prohibición absoluta de cuentas anónimas o bajo seudónimos. Las entidades están obligadas a identificar plenamente a todos sus clientes antes de establecer cualquier relación comercial, conforme al Art. 115 de la LIC y las Disposiciones de la CNBV, en línea con el GAFI Rec. 10.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "LIC Art. 115; Disposiciones de Carácter General CNBV; GAFI Rec. 10"
  },
  {
    "pregunta": "¿En qué consiste la 'verificación de identidad' dentro del proceso KYC?",
    "opciones": [
      "El proceso de confirmar que la información y documentos proporcionados por el cliente son auténticos y corresponden a la persona real que se está incorporando como cliente",
      "La revisión del historial crediticio del cliente en el buró de crédito",
      "La validación del nivel de ingresos mediante la declaración fiscal anual",
      "La comprobación de que el cliente no tenga deudas vigentes con el sistema financiero"
    ],
    "respuesta_correcta": 0,
    "explicacion": "La verificación de identidad consiste en contrastar los documentos y datos del cliente contra fuentes confiables para confirmar su autenticidad. Puede incluir consulta a bases de datos oficiales (RENAPO, SAT), verificación biométrica y validación documental presencial o remota. Es un elemento esencial del KYC conforme al GAFI Rec. 10 y las Disposiciones de la CNBV.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "GAFI Rec. 10; Disposiciones de Carácter General CNBV - Verificación de Identidad"
  },
  {
    "pregunta": "¿Cuándo debe actualizarse el expediente de un cliente conforme a las Disposiciones de la CNBV?",
    "opciones": [
      "Solo cuando el cliente lo solicita expresamente por escrito",
      "Cuando el cliente realiza una operación inusual, cuando cambian sus datos relevantes, o conforme a los plazos periódicos establecidos según su nivel de riesgo",
      "Únicamente al momento de la apertura de la cuenta y al cierre de la relación comercial",
      "La normativa no establece plazos; cada institución define libremente sus políticas de actualización"
    ],
    "respuesta_correcta": 1,
    "explicacion": "Las Disposiciones de la CNBV obligan a actualizar los expedientes cuando: se detectan cambios en la información del cliente, se realizan operaciones inusuales, o conforme a los plazos periódicos diferenciados por nivel de riesgo (más frecuente para clientes de alto riesgo). La actualización garantiza que el perfil transaccional refleje la situación actual del cliente.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Actualización de Expedientes"
  },
  {
    "pregunta": "¿Qué es el monitoreo transaccional en el contexto del cumplimiento PLD/FT?",
    "opciones": [
      "La revisión de los estados financieros de la institución por el auditor externo",
      "El control interno del presupuesto operativo del área de cumplimiento",
      "El proceso continuo de revisión y análisis de las operaciones de los clientes para detectar desviaciones de su perfil transaccional o señales de alerta de LD/FT",
      "La supervisión del cumplimiento de metas comerciales del equipo de ventas"
    ],
    "respuesta_correcta": 2,
    "explicacion": "El monitoreo transaccional es el proceso sistemático y continuo mediante el cual las entidades financieras analizan las operaciones de sus clientes para identificar comportamientos inusuales o sospechosos relacionados con LD/FT, comparándolos contra el perfil transaccional establecido en el KYC. Es una obligación central de las Disposiciones de la CNBV.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Monitoreo de Operaciones; GAFI Rec. 10"
  },
  {
    "pregunta": "¿Qué es una 'señal de alerta' (red flag) en el contexto del cumplimiento PLD/FT?",
    "opciones": [
      "Una notificación del sistema central sobre fallas técnicas en la plataforma bancaria",
      "Una alerta de fraude emitida cuando se detecta un error de digitación en una operación",
      "El aviso de vencimiento de documentos del expediente del cliente",
      "Un indicador o patrón de comportamiento que sugiere la posible existencia de una operación relacionada con LD/FT y que requiere análisis adicional por parte de la entidad"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Las señales de alerta son indicadores (red flags) que advierten sobre posibles vínculos con LD/FT: operaciones que no corresponden al perfil del cliente, uso excesivo de efectivo, estructura inusual de transacciones, inconsistencias en la información proporcionada, transacciones con jurisdicciones de alto riesgo, entre otros. Su identificación es la base del monitoreo efectivo conforme a la Guía CNBV.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Señales de Alerta; Disposiciones de Carácter General CNBV"
  },
  {
    "pregunta": "¿Qué obligación tienen las entidades financieras respecto a la capacitación de su personal en PLD/FT?",
    "opciones": [
      "Deben impartir capacitación periódica y documentada sobre prevención de LD/FT a todo el personal relevante, especialmente al que tiene contacto con clientes y operaciones",
      "Solo el Oficial de Cumplimiento debe recibir capacitación anual certificada",
      "La capacitación es opcional y se realiza únicamente cuando la CNBV lo solicita durante una visita de inspección",
      "Solo deben capacitarse los empleados nuevos durante su período de inducción inicial"
    ],
    "respuesta_correcta": 0,
    "explicacion": "Las Disposiciones de la CNBV establecen la obligación de implementar programas de capacitación continua en PLD/FT para todo el personal relevante, con énfasis en quienes tienen contacto directo con clientes. La capacitación debe ser documentada con listas de asistencia, su contenido actualizado regularmente, y cubrir señales de alerta, procedimientos de reporte y obligaciones legales.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Capacitación; GAFI Rec. 18"
  },
  {
    "pregunta": "¿Qué es el 'expediente del cliente' en materia de PLD/FT?",
    "opciones": [
      "El contrato de apertura de cuenta firmado por el cliente ante el notario",
      "El conjunto de documentos e información recopilada durante el proceso KYC que permite identificar al cliente, conocer su actividad económica y dar seguimiento continuo a la relación comercial",
      "El estado de cuenta mensual que refleja los movimientos y saldo del cliente",
      "El informe de calificación crediticia emitido por el buró de crédito"
    ],
    "respuesta_correcta": 1,
    "explicacion": "El expediente del cliente es el archivo (físico o digital) que contiene toda la documentación del KYC: identificación oficial verificada, comprobante de domicilio, información de actividad económica, declaración de origen de recursos, y demás documentos requeridos. Debe conservarse íntegro por al menos 10 años conforme al Art. 18 de la LFPIORPI.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "LFPIORPI Art. 18; Disposiciones de Carácter General CNBV - Expediente del Cliente"
  },
  {
    "pregunta": "¿Qué son las 'operaciones fraccionadas' o 'pitufeo' (smurfing) en el lavado de dinero?",
    "opciones": [
      "Operaciones de cambio de divisas realizadas simultáneamente en múltiples monedas extranjeras",
      "Transferencias electrónicas fraccionadas entre diferentes países para aprovechar tipos de cambio favorables",
      "La técnica de dividir grandes sumas de dinero ilícito en múltiples transacciones de menor monto para evadir los umbrales de reporte y los controles PLD/FT",
      "Operaciones de crédito distribuidas entre varios deudores solidarios para reducir el riesgo individual"
    ],
    "respuesta_correcta": 2,
    "explicacion": "El pitufeo o smurfing es una técnica de la etapa de colocación donde grandes cantidades de efectivo ilícito se dividen en múltiples depósitos o transacciones de montos pequeños para evitar superar los umbrales que generan la obligación de reporte. Es una señal de alerta clásica que los sistemas de monitoreo deben detectar analizando transacciones vinculadas.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Guía CNBV - Tipologías de LD; GAFI - Métodos y Tendencias"
  },
  {
    "pregunta": "¿Qué es la 'congelación de activos' en el contexto del cumplimiento PLD/FT?",
    "opciones": [
      "La inmovilización temporal de fondos a solicitud del cliente para protegerlos de fraude",
      "El bloqueo administrativo de cuentas con saldo cero por más de 12 meses de inactividad",
      "La retención preventiva de activos como garantía durante la tramitación de un crédito",
      "La medida que impide el movimiento, transferencia o uso de fondos de personas incluidas en listas de terroristas o sancionados, por orden de autoridad competente"
    ],
    "respuesta_correcta": 3,
    "explicacion": "La congelación de activos es la medida que impide la disposición de fondos pertenecientes a personas incluidas en la Lista de Personas Bloqueadas de la SHCP o en listas internacionales de sancionados (OFAC, ONU). Las entidades deben implementar procedimientos para identificar y bloquear de inmediato dichos activos y reportar a la autoridad.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "LFPIORPI Art. 2; Guía CNBV - Terrorismo y Proliferación; GAFI Rec. 6"
  },
  {
    "pregunta": "¿Qué información esencial debe contener el perfil de un cliente para efectos de PLD/FT?",
    "opciones": [
      "Datos de identificación verificados, actividad económica, origen y destino habitual de recursos, y comportamiento transaccional esperado (montos y frecuencia)",
      "Exclusivamente el número de productos contratados y los saldos promedio históricos",
      "Solo la información crediticia: historial de pagos y capacidad de endeudamiento",
      "Únicamente los datos personales básicos: nombre, fecha de nacimiento y CURP"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El perfil del cliente para PLD/FT debe integrar: datos de identificación verificados, actividad económica o giro del negocio, origen y destino habitual de los recursos, montos y frecuencia esperada de operaciones, y los factores que determinan su nivel de riesgo. Este perfil es la base para detectar operaciones inusuales cuando el comportamiento real se desvía significativamente.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "Disposiciones de Carácter General CNBV - Perfil del Cliente; GAFI Rec. 10"
  },
  {
    "pregunta": "¿Cómo afectan las listas de jurisdicciones con deficiencias estratégicas del GAFI a las entidades financieras mexicanas?",
    "opciones": [
      "No tienen efecto directo; solo son documentos informativos para los reguladores internacionales",
      "Las entidades deben aplicar Debida Diligencia Reforzada a clientes, transacciones y contrapartes provenientes de jurisdicciones listadas con deficiencias estratégicas por el GAFI",
      "Prohíben totalmente cualquier operación con personas o entidades de esos países",
      "Solo afectan a los bancos con operaciones internacionales, no a las instituciones exclusivamente locales"
    ],
    "respuesta_correcta": 1,
    "explicacion": "El GAFI publica periódicamente listas de jurisdicciones con deficiencias estratégicas en sus sistemas PLD/FT (lista negra y lista gris). Las entidades financieras mexicanas deben aplicar medidas de Debida Diligencia Reforzada a operaciones con clientes o contrapartes de dichos países, conforme al GAFI Rec. 19 y las Disposiciones de la CNBV sobre jurisdicciones de riesgo.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "fácil",
    "fuente": "GAFI Rec. 19; Disposiciones de Carácter General CNBV - Jurisdicciones de Riesgo"
  },
  {
    "pregunta": "¿Qué pasos específicos incluye el proceso de Debida Diligencia para personas morales?",
    "opciones": [
      "Solo la presentación del acta constitutiva y el RFC de la empresa ante la institución",
      "Únicamente la verificación del registro ante el SAT y el cumplimiento de obligaciones fiscales",
      "Obtención de acta constitutiva, poderes notariales, identificación de socios con participación significativa, beneficiario controlador, representante legal, actividad económica y origen de recursos",
      "Exclusivamente la consulta del buró de crédito empresarial y la revisión de estados financieros auditados"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Para personas morales, la Debida Diligencia requiere: acta constitutiva o equivalente, poderes notariales del representante legal, identificación oficial del representante, identificación de socios o accionistas con participación significativa, identificación del beneficiario controlador (persona física que ejerce control real), RFC, actividad económica y origen de recursos.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Identificación de Personas Morales; GAFI Rec. 24"
  },
  {
    "pregunta": "¿Cuáles son los elementos mínimos que debe contener un Programa PLD/FT conforme a las Disposiciones de la CNBV?",
    "opciones": [
      "Solo el manual de procedimientos y la lista actualizada de clientes de alto riesgo",
      "Únicamente el código de ética y la política de sanciones disciplinarias internas",
      "Solo la designación del Oficial de Cumplimiento y el calendario de reportes periódicos",
      "Políticas KYC, metodología de evaluación de riesgos, procedimientos de monitoreo y reporte, programa de capacitación, y designación del Oficial de Cumplimiento, entre otros elementos"
    ],
    "respuesta_correcta": 3,
    "explicacion": "El Programa PLD/FT debe incluir como mínimo: política KYC (identificación y conocimiento del cliente), metodología de evaluación de riesgos (EBR), procedimientos para detectar y reportar operaciones inusuales y sospechosas, programa de capacitación periódica, designación del Oficial de Cumplimiento, mecanismos de control interno y programa de auditoría independiente.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Programa PLD/FT; GAFI Rec. 18"
  },
  {
    "pregunta": "¿Qué es el monitoreo transaccional automatizado y cuál es su función en el cumplimiento PLD/FT?",
    "opciones": [
      "Sistema tecnológico que analiza en tiempo real o por lote las operaciones de los clientes, generando alertas cuando se detectan patrones inusuales o se superan umbrales predefinidos",
      "Plataforma de facturación electrónica para registrar automáticamente las comisiones y cargos bancarios",
      "Sistema de reporteo automático de estados financieros consolidados a la CNBV",
      "Software de control de inventario de efectivo en bóvedas y cajas de las sucursales"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El monitoreo transaccional automatizado (Transaction Monitoring System) es la herramienta tecnológica que permite a las entidades analizar masivamente las transacciones de los clientes, aplicando reglas y modelos estadísticos para generar alertas sobre comportamientos inusuales o superación de umbrales. Es un componente esencial del programa PLD/FT para instituciones con gran volumen operativo.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Guía CNBV - Sistemas de Monitoreo; Disposiciones de Carácter General CNBV"
  },
  {
    "pregunta": "¿Cuáles son los criterios principales para clasificar a un cliente como de 'alto riesgo' en PLD/FT?",
    "opciones": [
      "Solo el monto de sus depósitos mensuales; a mayor monto, mayor riesgo asignado",
      "Ser PEP, pertenecer a sectores de alto riesgo, operar con altos volúmenes de efectivo, residir en jurisdicciones de riesgo, o presentar estructuras societarias complejas con beneficiario controlador difícil de identificar",
      "Únicamente el número de cuentas que mantiene abiertas en diferentes instituciones financieras",
      "Exclusivamente el historial de reclamaciones ante la CONDUSEF en los últimos dos años"
    ],
    "respuesta_correcta": 1,
    "explicacion": "La clasificación de alto riesgo se basa en múltiples factores bajo el Enfoque Basado en Riesgos: tipo de cliente (PEPs, personas en listas de sancionados), sector de actividad (casinos, cambio de divisas, inmobiliaria), patrones de uso de efectivo, país de residencia o actividad (jurisdicciones GAFI), y complejidad de la estructura corporativa. La CNBV evalúa la robustez de estos criterios en sus inspecciones.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Clasificación de Riesgo; GAFI Rec. 1"
  },
  {
    "pregunta": "¿Qué obligaciones específicas establece la normativa para el monitoreo de Personas Políticamente Expuestas (PEPs)?",
    "opciones": [
      "Los PEPs están exentos de monitoreo si su cargo ha sido validado por la Secretaría de la Función Pública",
      "Solo deben monitorearse durante el período en que ejercen activamente el cargo público",
      "Requieren aprobación de un nivel jerárquico superior para establecer la relación, monitoreo continuo de operaciones, y seguimiento durante un período razonable después de cesar en el cargo",
      "El monitoreo de PEPs es idéntico al de cualquier cliente regular; no existen diferencias procedimentales"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Para PEPs, el GAFI Rec. 12 y las Disposiciones de la CNBV establecen: obtener aprobación de la alta dirección para iniciar o continuar la relación, tomar medidas para identificar el origen de los fondos, y monitorear continuamente su actividad. El estatus de PEP debe mantenerse bajo seguimiento incluso después de dejar el cargo, durante un período razonable definido por la propia entidad.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 12; Disposiciones de Carácter General CNBV - Personas Políticamente Expuestas"
  },
  {
    "pregunta": "¿Con qué frecuencia deben actualizarse los expedientes de clientes clasificados como de alto riesgo?",
    "opciones": [
      "La normativa no establece plazos diferenciados; la institución decide su política libremente",
      "Con la misma frecuencia que los clientes de bajo riesgo: actualización general cada cinco años",
      "Solo cuando el cliente realiza una operación individual mayor al equivalente de USD 10,000",
      "Con mayor periodicidad que los clientes de bajo o medio riesgo; las Disposiciones de la CNBV establecen plazos diferenciados siendo más cortos para clientes de alto riesgo, generalmente con una revisión anual o más frecuente"
    ],
    "respuesta_correcta": 3,
    "explicacion": "Las Disposiciones de la CNBV aplican el principio del EBR a la actualización de expedientes: los clientes de alto riesgo deben actualizarse con mayor frecuencia (típicamente anual o menor plazo) en comparación con clientes de bajo riesgo (que pueden actualizarse cada tres a cinco años o cuando se detecten cambios significativos). La frecuencia diferenciada garantiza que el perfil del cliente refleje su realidad actual.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Actualización de Expedientes según Nivel de Riesgo"
  },
  {
    "pregunta": "¿Cuál es el procedimiento correcto para reportar una Operación Sospechosa ante la CNBV?",
    "opciones": [
      "El Oficial de Cumplimiento valida el análisis interno, determina la procedencia del reporte y lo presenta a la CNBV dentro de los plazos establecidos a través del sistema oficial, sin notificar al cliente",
      "Cualquier empleado puede reportar directamente a la CNBV sin intermediación del Oficial de Cumplimiento",
      "El reporte debe presentarse exclusivamente en papel y enviarse por correo certificado a las oficinas de la CNBV",
      "El cliente debe ser notificado antes de presentar el reporte para brindarle la oportunidad de explicar la operación"
    ],
    "respuesta_correcta": 0,
    "explicacion": "El procedimiento del ROS incluye: detección de inusualidad, análisis por el analista PLD, escalamiento al Oficial de Cumplimiento quien determina si procede el reporte, y presentación a través del sistema oficial de la CNBV dentro del plazo normativo. Está estrictamente prohibido notificar al cliente (tipping-off), conducta sancionada por la LFPIORPI.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Reportes de Operaciones Sospechosas; LFPIORPI Art. 25"
  },
  {
    "pregunta": "¿Qué es la 'Debida Diligencia sobre el corresponsal' en operaciones de banca corresponsal?",
    "opciones": [
      "La revisión del estado financiero del banco corresponsal para verificar su solvencia patrimonial",
      "El proceso mediante el cual una institución evalúa el programa PLD/FT, la reputación y el nivel de supervisión de otra institución financiera con la que establece una relación de corresponsalía",
      "La verificación de los límites de crédito interbancario autorizados entre instituciones corresponsales",
      "La revisión de los contratos de intercambio de divisas y tasas pactadas con los bancos internacionales"
    ],
    "respuesta_correcta": 1,
    "explicacion": "La Debida Diligencia sobre corresponsales requiere evaluar: el régimen regulatorio y de supervisión del país donde opera el banco respondente, la calidad de su programa PLD/FT, su reputación y naturaleza del negocio, antes de establecer la relación. Las entidades deben abstenerse de establecer corresponsalías con instituciones que no aplican estándares mínimos de PLD/FT (shell banks).",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 13; Disposiciones de Carácter General CNBV - Banca Corresponsal"
  },
  {
    "pregunta": "¿Qué información mínima debe recabarse de una persona moral durante el proceso KYC?",
    "opciones": [
      "Solo el nombre de la empresa y su RFC actualizado",
      "Únicamente el acta constitutiva y el estado de cuenta bancario más reciente",
      "Denominación social, RFC, domicilio fiscal, actividad económica, acta constitutiva, identificación del representante legal e identificación de la persona física que es el beneficiario controlador",
      "Solo los datos del director general y del apoderado que firma los documentos comerciales"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Para personas morales, la Debida Diligencia exige: denominación o razón social, RFC, domicilio fiscal, actividad económica, acta constitutiva, poder notarial del representante legal, identificación oficial del representante, y de forma especialmente relevante, la identificación de la persona física que es el beneficiario controlador final, es decir, quien ejerce control real sobre la entidad.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Personas Morales; GAFI Rec. 24"
  },
  {
    "pregunta": "¿Qué es el 'screening' o revisión de listas en el proceso KYC y por qué es obligatorio?",
    "opciones": [
      "El proceso de evaluación crediticia del cliente mediante modelos de puntuación antes de otorgar financiamiento",
      "La revisión del currículum vítae y antecedentes laborales del personal que ocupará cargos sensibles",
      "El análisis de la capacidad de pago del cliente mediante modelos estadísticos de riesgo crediticio",
      "La consulta sistemática de listas de personas sancionadas (Lista Bloqueados SHCP, OFAC, ONU) para verificar que el cliente no figure en ellas antes de establecer la relación comercial"
    ],
    "respuesta_correcta": 3,
    "explicacion": "El screening de listas es la verificación obligatoria contra: Lista de Personas Bloqueadas (SHCP), lista OFAC (Tesoro de EE.UU.), listas del Consejo de Seguridad de la ONU, y otras listas relevantes. Debe realizarse al inicio de la relación y periódicamente durante su duración. Un resultado positivo obliga al bloqueo de activos y reporte inmediato a las autoridades.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "LFPIORPI Art. 2; Guía CNBV - Verificación de Listas; GAFI Rec. 6"
  },
  {
    "pregunta": "¿Cuáles son las fases del ciclo de vida del cliente desde la perspectiva del cumplimiento PLD/FT?",
    "opciones": [
      "Onboarding (KYC inicial, verificación, screening y asignación de riesgo), operación activa (monitoreo continuo y actualización de expediente), y cierre de la relación (con reporte si aplica)",
      "Solo existen dos fases desde la perspectiva PLD/FT: apertura y cierre de la cuenta",
      "Las fases son exclusivamente: crédito, ahorro, inversión y seguro, según el producto contratado",
      "El ciclo de vida del cliente no es un concepto reconocido formalmente en la normativa PLD/FT de la CNBV"
    ],
    "respuesta_correcta": 0,
    "explicacion": "Desde la perspectiva PLD/FT, el ciclo del cliente comprende: 1) Onboarding: KYC inicial, verificación de identidad, screening de listas y asignación del nivel de riesgo; 2) Durante la relación: monitoreo continuo de operaciones, actualización periódica del expediente conforme al riesgo; 3) Cierre o terminación: procedimientos de salida, incluyendo reporte si la relación se termina por razones de cumplimiento.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Ciclo del Cliente; GAFI Rec. 10"
  },
  {
    "pregunta": "¿Qué es el 'análisis de riesgo del cliente' y cómo determina el nivel de diligencia aplicable?",
    "opciones": [
      "La evaluación de la capacidad crediticia del cliente para autorizar productos de financiamiento bancario",
      "La evaluación de los factores de riesgo de LD/FT de un cliente específico (tipo, actividad, origen de fondos, geografía) que determina si aplica Debida Diligencia simplificada, estándar o reforzada y la frecuencia del monitoreo",
      "La revisión del historial de reclamaciones del cliente ante la CONDUSEF en los últimos años",
      "El análisis de rentabilidad del cliente para determinar si es viable comercialmente para la institución"
    ],
    "respuesta_correcta": 1,
    "explicacion": "El análisis de riesgo del cliente asigna una calificación (bajo, medio, alto) con base en factores como: tipo de cliente, sector de actividad, uso de efectivo, jurisdicción, productos solicitados y estructura corporativa. Esta clasificación determina el nivel de DD aplicable (simplificada, estándar o reforzada) y la frecuencia del monitoreo y actualización del expediente, conforme al EBR.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Evaluación de Riesgo del Cliente; GAFI Rec. 1"
  },
  {
    "pregunta": "¿Qué son los 'umbrales de reporte' en el sistema de monitoreo PLD/FT?",
    "opciones": [
      "Los límites máximos de crédito que una institución puede otorgar a un solo cliente según su perfil",
      "Los niveles mínimos de capital regulatorio que una institución debe mantener para operar conforme a Basilea III",
      "Los montos o parámetros predefinidos que, al ser superados por una operación o conjunto de operaciones, activan la obligación de reportar o realizar análisis adicional (ej. USD 10,000 para operaciones relevantes)",
      "Los límites de tolerancia al riesgo operacional definidos por el comité de riesgos de la institución"
    ],
    "respuesta_correcta": 2,
    "explicacion": "Los umbrales de reporte son los parámetros cuantitativos que activan obligaciones específicas: el umbral de USD 10,000 para Operaciones Relevantes en instituciones de crédito, los montos por tipo de Actividad Vulnerable en la LFPIORPI, o los umbrales internos del sistema de monitoreo que generan alertas para análisis adicional. Su correcta calibración es clave para la efectividad del programa PLD/FT.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "LFPIORPI Art. 17; Disposiciones de Carácter General CNBV - Umbrales y Operaciones Relevantes"
  },
  {
    "pregunta": "¿Cuáles son los requisitos mínimos del programa de capacitación en PLD/FT conforme a las Disposiciones de la CNBV?",
    "opciones": [
      "Solo se requiere una capacitación inicial al momento de la contratación, sin necesidad de actualizaciones periódicas",
      "La capacitación es responsabilidad exclusiva del empleado; la institución solo debe facilitar materiales de consulta",
      "Solo el personal del área de cumplimiento y riesgos requiere capacitación especializada en PLD/FT",
      "Debe ser periódica, documentada, dirigida al personal relevante incluyendo la alta dirección, abarcar señales de alerta y procedimientos de reporte, y actualizarse ante cambios normativos o de tipologías"
    ],
    "respuesta_correcta": 3,
    "explicacion": "El programa de capacitación PLD/FT debe: ser periódico (generalmente anual o más frecuente), documentarse con listas de asistencia y evaluaciones, cubrir desde la alta dirección hasta el personal de contacto con clientes, incluir contenidos sobre señales de alerta, procedimientos internos, obligaciones legales y consecuencias del incumplimiento, y actualizarse regularmente conforme a nuevas tipologías o cambios normativos.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Programa de Capacitación; GAFI Rec. 18"
  },
  {
    "pregunta": "¿Qué es la 'banca corresponsal' y qué riesgos PLD/FT específicos implica para las instituciones mexicanas?",
    "opciones": [
      "Relación entre dos instituciones donde una provee servicios bancarios a la otra, con riesgo inherente de que la institución respondente sea usada para introducir fondos ilícitos de jurisdicciones con menor control PLD/FT",
      "El servicio de cajeros automáticos compartidos que los bancos ofrecen en tiendas de conveniencia",
      "El sistema de compensación de cheques intrasistema entre sucursales de un mismo grupo financiero",
      "Los servicios de administración centralizada de efectivo que los bancos ofrecen a grandes corporativos"
    ],
    "respuesta_correcta": 0,
    "explicacion": "La banca corresponsal es la provisión de servicios bancarios por un banco (corresponsal) a otro banco (respondente). El riesgo PLD/FT es que el banco corresponsal tiene acceso indirecto a clientes del respondente sin conocerlos directamente, lo que puede ser explotado para introducir fondos ilícitos. El GAFI Rec. 13 exige DD específica antes de establecer estas relaciones.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "GAFI Rec. 13; Disposiciones de Carácter General CNBV - Banca Corresponsal"
  },
  {
    "pregunta": "¿Qué son las 'transacciones vinculadas' o relacionadas en el monitoreo PLD/FT?",
    "opciones": [
      "Las operaciones realizadas entre empresas pertenecientes al mismo grupo financiero",
      "Múltiples transacciones que individualmente no generan alerta, pero que analizadas en conjunto (por monto total, beneficiario, temporalidad o patrón) revelan un posible intento de evadir umbrales o controles PLD/FT",
      "Las transferencias electrónicas autorizadas entre diferentes cuentas del mismo titular",
      "Las operaciones realizadas mediante convenio formal entre dos instituciones financieras distintas"
    ],
    "respuesta_correcta": 1,
    "explicacion": "Las transacciones vinculadas son operaciones que deben analizarse en conjunto porque forman parte de un mismo patrón: varias operaciones en el mismo día, con el mismo origen o destino, o que suman un monto relevante. La capacidad del sistema de monitoreo para identificarlas y consolidarlas es esencial para detectar técnicas como el pitufeo (smurfing) y otras tipologías de LD.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Monitoreo de Operaciones Relacionadas; GAFI"
  },
  {
    "pregunta": "¿Qué debe contemplar el 'Programa de Auditoría PLD/FT' de una entidad financiera?",
    "opciones": [
      "Solo la revisión anual de los estados financieros consolidados por el auditor externo independiente",
      "Exclusivamente la verificación del cumplimiento de obligaciones fiscales y presentación de declaraciones ante el SAT",
      "La evaluación independiente y periódica del Programa PLD/FT, verificando la efectividad de controles, el cumplimiento normativo, la calidad de los reportes y la idoneidad del sistema de monitoreo",
      "Solo la revisión del cumplimiento del código de ética corporativo y las políticas de conducta interna"
    ],
    "respuesta_correcta": 2,
    "explicacion": "El Programa de Auditoría PLD/FT, que debe ser independiente del área de cumplimiento, evalúa: suficiencia y efectividad de políticas y procedimientos, calidad de los expedientes de clientes, efectividad del sistema de monitoreo, adecuación de los reportes presentados, y suficiencia del programa de capacitación. Sus hallazgos deben reportarse al órgano de gobierno de la institución.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "medio",
    "fuente": "Disposiciones de Carácter General CNBV - Auditoría PLD/FT; GAFI Rec. 18"
  },
  {
    "pregunta": "¿Qué elementos fundamentales debe contener un Reporte de Operación Sospechosa (ROS) para ser considerado completo y adecuado?",
    "opciones": [
      "Solo la fecha, monto y tipo de la operación sospechosa sin mayor detalle",
      "Únicamente los datos del cliente y el tipo de producto o cuenta utilizado",
      "Solo la descripción narrativa general sin necesidad de identificar con precisión al cliente ni las cuentas involucradas",
      "Datos de identificación del cliente, descripción detallada de la(s) operación(es), montos, fechas, la razón que sustenta la sospecha, el análisis de inconsistencias con el perfil del cliente, y documentación de respaldo"
    ],
    "respuesta_correcta": 3,
    "explicacion": "El ROS debe ser completo y bien fundamentado: incluye datos del cliente (identificación completa, perfil transaccional), descripción precisa de las operaciones sospechosas (fecha, monto, tipo, contraparte, cuenta), narrativa explicando la inconsistencia con el perfil del cliente, el análisis que sustenta la sospecha, y la documentación de respaldo. Un ROS incompleto puede ser objeto de observaciones de la CNBV.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "difícil",
    "fuente": "Disposiciones de Carácter General CNBV - Contenido del ROS; LFPIORPI Art. 25"
  },
  {
    "pregunta": "¿Cuáles son las principales facultades sancionadoras de la CNBV frente al incumplimiento de obligaciones PLD/FT?",
    "opciones": [
      "Amonestaciones, multas económicas de cuantía significativa, suspensión de operaciones, inhabilitación de funcionarios e incluso revocación de la autorización para operar, según la gravedad y recurrencia del incumplimiento",
      "Solo multas menores de hasta $50,000 MXN por cada incumplimiento aislado detectado en visita",
      "Exclusivamente la obligación de volver a capacitar a todo el personal involucrado",
      "Solo la publicación del nombre de la institución infractora en el Diario Oficial de la Federación"
    ],
    "respuesta_correcta": 0,
    "explicacion": "La CNBV tiene facultades sancionadoras amplias conforme a la LIC y la LFPIORPI: puede imponer amonestaciones, multas por montos significativos (calculados sobre el capital de la institución o por número de incumplimientos), suspensión o restricción de operaciones, inhabilitación de directivos y funcionarios, y en casos de incumplimiento grave o recurrente, la revocación de la autorización para operar.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "difícil",
    "fuente": "LIC Art. 108-110; LFPIORPI Art. 53-55; Disposiciones de Carácter General CNBV - Sanciones"
  },
  {
    "pregunta": "¿Qué implica el principio de 'responsabilidad de la alta dirección' en el programa PLD/FT de una entidad financiera?",
    "opciones": [
      "La alta dirección solo es responsable si participó directamente y con dolo en operaciones ilícitas",
      "El Consejo de Administración y el Director General tienen responsabilidad de gobernanza sobre el programa PLD/FT: deben aprobar políticas, destinar recursos suficientes y rendir cuentas ante el regulador por las deficiencias detectadas",
      "La responsabilidad de PLD/FT recae exclusivamente en el Oficial de Cumplimiento, liberando de responsabilidad a la alta dirección",
      "Solo los funcionarios que firman físicamente los reportes a la CNBV tienen responsabilidad legal individual"
    ],
    "respuesta_correcta": 1,
    "explicacion": "El GAFI Rec. 18 y las Disposiciones de la CNBV establecen que el Consejo de Administración y la Alta Dirección tienen responsabilidad de gobernanza: deben aprobar las políticas PLD/FT, designar al Oficial de Cumplimiento, asignar recursos humanos y tecnológicos adecuados, recibir informes periódicos sobre la efectividad del programa, y responder ante el regulador. No pueden delegar completamente esta responsabilidad.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "difícil",
    "fuente": "GAFI Rec. 18; Disposiciones de Carácter General CNBV - Responsabilidad Institucional y Gobernanza"
  },
  {
    "pregunta": "¿Qué es la 'efectividad' del programa PLD/FT y cómo la evalúa la CNBV en sus inspecciones?",
    "opciones": [
      "La efectividad no existe como concepto formal evaluable en la normativa mexicana de PLD/FT",
      "Es la prueba de estrés financiero que los bancos realizan para evaluar su solvencia ante escenarios adversos",
      "El grado en que el programa PLD/FT logra detectar, prevenir y reportar efectivamente operaciones de LD/FT, evaluado mediante indicadores como: número y calidad de reportes, alertas generadas vs. casos confirmados, cobertura de capacitación y hallazgos de auditoría",
      "Es la certificación internacional ISO 37001 que las instituciones deben obtener para demostrar su cumplimiento ante el GAFI"
    ],
    "respuesta_correcta": 2,
    "explicacion": "La efectividad del programa PLD/FT trasciende el cumplimiento formal (tener políticas escritas o expedientes completos): la CNBV y el GAFI en su metodología de evaluación 2013 evalúan resultados concretos como la calidad de los ROS presentados, la detección real de operaciones inusuales, la adecuada calibración del sistema de monitoreo, la comprensión demostrable del personal y la capacidad de la entidad para gestionar sus riesgos.",
    "tema": "Procedimientos de Cumplimiento",
    "dificultad": "difícil",
    "fuente": "GAFI - Metodología de Evaluación 2013 (Efectividad); Guía CNBV - Efectividad del Programa PLD/FT"
  }
];
