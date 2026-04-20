import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'pt';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
    pt: string;
  };
}

const translations: Translations = {
  // Header
  'header.badgeCollection': { 
    en: 'Badge Collection Platform', 
    es: 'Plataforma de Colección de Insignias',
    pt: 'Plataforma de Coleção de Emblemas'
  },
  'header.login': { 
    en: 'Login', 
    es: 'Iniciar Sesión',
    pt: 'Entrar'
  },
  'header.logout': { 
    en: 'Logout', 
    es: 'Cerrar Sesión',
    pt: 'Sair'
  },
  'header.loggingIn': { 
    en: 'Logging in...', 
    es: 'Iniciando sesión...',
    pt: 'Entrando...'
  },
  
  // Footer
  'footer.builtWith': { 
    en: 'Built with', 
    es: 'Construido con',
    pt: 'Construído com'
  },
  'footer.using': { 
    en: 'using', 
    es: 'usando',
    pt: 'usando'
  },
  'footer.about': {
    en: 'About',
    es: 'Acerca de',
    pt: 'Sobre'
  },
  
  // About
  'about.title': {
    en: 'About OpenSpora',
    es: 'Acerca de OpenSpora',
    pt: 'Sobre OpenSpora'
  },
  'about.product': {
    en: 'This is a product of Corporación KaidáO - NIT 9019577984, and is given under AGPL-3.0.',
    es: 'Este es un producto de Corporación KaidáO - NIT 9019577984, y se otorga bajo AGPL-3.0.',
    pt: 'Este é um produto da Corporação KaidáO - NIT 9019577984, e é fornecido sob AGPL-3.0.'
  },
  'about.close': {
    en: 'Close',
    es: 'Cerrar',
    pt: 'Fechar'
  },
  
  // App - Welcome
  'app.loading': { 
    en: 'Loading OpenSpora...', 
    es: 'Cargando OpenSpora...',
    pt: 'Carregando OpenSpora...'
  },
  'app.welcome': { 
    en: 'Welcome to OpenSpora', 
    es: 'Bienvenido a OpenSpora',
    pt: 'Bem-vindo ao OpenSpora'
  },
  'app.welcomeDesc': { 
    en: 'Create communities, collect badges, and track your achievements', 
    es: 'Crea comunidades, colecciona insignias y rastrea tus logros',
    pt: 'Crie comunidades, colete emblemas e acompanhe suas conquistas'
  },
  'app.badgeReady': { 
    en: 'Badge Ready to Claim', 
    es: 'Insignia Lista para Reclamar',
    pt: 'Emblema Pronto para Reivindicar'
  },
  'app.badgeReadyDesc': { 
    en: 'You\'ve scanned a badge QR code! Please log in to claim your badge.', 
    es: '¡Has escaneado un código QR de insignia! Por favor, inicia sesión para reclamar tu insignia.',
    pt: 'Você escaneou um código QR de emblema! Por favor, faça login para reivindicar seu emblema.'
  },
  'app.claimCode': { 
    en: 'Claim code:', 
    es: 'Código de reclamo:',
    pt: 'Código de reivindicação:'
  },
  'app.loginToClaim': { 
    en: 'Login to Claim Badge', 
    es: 'Iniciar Sesión para Reclamar Insignia',
    pt: 'Entrar para Reivindicar Emblema'
  },
  'app.afterLogin': { 
    en: 'After logging in, your badge will be claimed automatically', 
    es: 'Después de iniciar sesión, tu insignia se reclamará automáticamente',
    pt: 'Após fazer login, seu emblema será reivindicado automaticamente'
  },
  'app.pleaseLogin': { 
    en: 'Please log in to start collecting badges and managing communities', 
    es: 'Por favor, inicia sesión para comenzar a coleccionar insignias y gestionar comunidades',
    pt: 'Por favor, faça login para começar a coletar emblemas e gerenciar comunidades'
  },
  
  // Profile Setup
  'profile.welcome': { 
    en: 'Welcome to OpenSpora!', 
    es: '¡Bienvenido a OpenSpora!',
    pt: 'Bem-vindo ao OpenSpora!'
  },
  'profile.setupDesc': { 
    en: 'Let\'s set up your profile to get started', 
    es: 'Configuremos tu perfil para comenzar',
    pt: 'Vamos configurar seu perfil para começar'
  },
  'profile.yourName': { 
    en: 'Your Name', 
    es: 'Tu Nombre',
    pt: 'Seu Nome'
  },
  'profile.enterName': { 
    en: 'Enter your name', 
    es: 'Ingresa tu nombre',
    pt: 'Digite seu nome'
  },
  'profile.continue': { 
    en: 'Continue', 
    es: 'Continuar',
    pt: 'Continuar'
  },
  'profile.settingUp': { 
    en: 'Setting up...', 
    es: 'Configurando...',
    pt: 'Configurando...'
  },
  
  // Dashboard
  'dashboard.title': { 
    en: 'Your OpenSpora Dashboard', 
    es: 'Tu Panel de OpenSpora',
    pt: 'Seu Painel OpenSpora'
  },
  'dashboard.subtitle': { 
    en: 'Manage your badges and communities', 
    es: 'Gestiona tus insignias y comunidades',
    pt: 'Gerencie seus emblemas e comunidades'
  },
  'dashboard.myBadges': { 
    en: 'My Badges', 
    es: 'Mis Insignias',
    pt: 'Meus Emblemas'
  },
  'dashboard.claim': { 
    en: 'Claim', 
    es: 'Reclamar',
    pt: 'Reivindicar'
  },
  'dashboard.manage': { 
    en: 'Manage', 
    es: 'Gestionar',
    pt: 'Gerenciar'
  },
  'dashboard.statistics': { 
    en: 'Statistics', 
    es: 'Estadísticas',
    pt: 'Estatísticas'
  },
  'dashboard.error': { 
    en: 'Something went wrong', 
    es: 'Algo salió mal',
    pt: 'Algo deu errado'
  },
  'dashboard.tryAgain': { 
    en: 'Try again', 
    es: 'Intentar nuevamente',
    pt: 'Tentar novamente'
  },
  
  // My Badges
  'badges.totalCollected': { 
    en: 'Total Badges Collected', 
    es: 'Total de Insignias Coleccionadas',
    pt: 'Total de Emblemas Coletados'
  },
  'badges.communitiesJoined': { 
    en: 'Communities Joined', 
    es: 'Comunidades Unidas',
    pt: 'Comunidades Participadas'
  },
  'badges.noBadges': { 
    en: 'No Badges Yet', 
    es: 'Aún No Hay Insignias',
    pt: 'Ainda Sem Emblemas'
  },
  'badges.noBadgesDesc': { 
    en: 'You haven\'t collected any badges yet', 
    es: 'Aún no has coleccionado ninguna insignia',
    pt: 'Você ainda não coletou nenhum emblema'
  },
  'badges.startClaiming': { 
    en: 'Start by claiming badges using QR codes or claim codes in the "Claim Badge" tab', 
    es: 'Comienza reclamando insignias usando códigos QR o códigos de reclamo en la pestaña "Reclamar Insignia"',
    pt: 'Comece reivindicando emblemas usando códigos QR ou códigos de reivindicação na aba "Reivindicar Emblema"'
  },
  'badges.badge': { 
    en: 'badge', 
    es: 'insignia',
    pt: 'emblema'
  },
  'badges.badges': { 
    en: 'badges', 
    es: 'insignias',
    pt: 'emblemas'
  },
  'badges.collected': { 
    en: 'collected', 
    es: 'coleccionadas',
    pt: 'coletados'
  },
  'badges.claimed': { 
    en: 'Claimed', 
    es: 'Reclamada',
    pt: 'Reivindicado'
  },
  'badges.loading': { 
    en: 'Loading your badges...', 
    es: 'Cargando tus insignias...',
    pt: 'Carregando seus emblemas...'
  },
  'badges.loadError': { 
    en: 'Failed to load badges. Please try refreshing the page.', 
    es: 'Error al cargar insignias. Por favor, intenta actualizar la página.',
    pt: 'Falha ao carregar emblemas. Por favor, tente atualizar a página.'
  },
  'badges.recentlyClaimed': {
    en: 'Recently Claimed',
    es: 'Reclamada Recientemente',
    pt: 'Reivindicado Recentemente'
  },
  'badges.latestAchievement': {
    en: 'Your latest achievement',
    es: 'Tu último logro',
    pt: 'Sua última conquista'
  },
  'badges.byComm': {
    en: 'Badges by Community',
    es: 'Insignias por Comunidad',
    pt: 'Emblemas por Comunidade'
  },
  
  // Claim Badge
  'claim.title': { 
    en: 'Claim a Badge', 
    es: 'Reclamar una Insignia',
    pt: 'Reivindicar um Emblema'
  },
  'claim.description': { 
    en: 'Scan a QR code or enter a claim code to add a badge to your collection', 
    es: 'Escanea un código QR o ingresa un código de reclamo para agregar una insignia a tu colección',
    pt: 'Escaneie um código QR ou digite um código de reivindicação para adicionar um emblema à sua coleção'
  },
  'claim.processing': { 
    en: 'Processing Claim', 
    es: 'Procesando Reclamo',
    pt: 'Processando Reivindicação'
  },
  'claim.processingDesc': { 
    en: 'Processing your badge claim from the QR code...', 
    es: 'Procesando tu reclamo de insignia desde el código QR...',
    pt: 'Processando sua reivindicação de emblema do código QR...'
  },
  'claim.success': { 
    en: 'Success!', 
    es: '¡Éxito!',
    pt: 'Sucesso!'
  },
  'claim.successMsg': { 
    en: 'Badge claimed successfully! 🎉 Check the "My Badges" tab to see it.', 
    es: '¡Insignia reclamada con éxito! 🎉 Revisa la pestaña "Mis Insignias" para verla.',
    pt: 'Emblema reivindicado com sucesso! 🎉 Confira a aba "Meus Emblemas" para vê-lo.'
  },
  'claim.failed': { 
    en: 'Claim Failed', 
    es: 'Reclamo Fallido',
    pt: 'Reivindicação Falhou'
  },
  'claim.qrScanner': { 
    en: 'QR Scanner', 
    es: 'Escáner QR',
    pt: 'Scanner QR'
  },
  'claim.manualEntry': { 
    en: 'Manual Entry', 
    es: 'Entrada Manual',
    pt: 'Entrada Manual'
  },
  'claim.claimCode': { 
    en: 'Claim Code', 
    es: 'Código de Reclamo',
    pt: 'Código de Reivindicação'
  },
  'claim.enterCode': { 
    en: 'Enter your claim code', 
    es: 'Ingresa tu código de reclamo',
    pt: 'Digite seu código de reivindicação'
  },
  'claim.enterCodeDesc': { 
    en: 'Enter the unique code provided with your badge', 
    es: 'Ingresa el código único proporcionado con tu insignia',
    pt: 'Digite o código único fornecido com seu emblema'
  },
  'claim.claimBadge': { 
    en: 'Claim Badge', 
    es: 'Reclamar Insignia',
    pt: 'Reivindicar Emblema'
  },
  'claim.claiming': { 
    en: 'Claiming...', 
    es: 'Reclamando...',
    pt: 'Reivindicando...'
  },
  'claim.howTo': { 
    en: 'How to claim badges:', 
    es: 'Cómo reclamar insignias:',
    pt: 'Como reivindicar emblemas:'
  },
  'claim.howToQR': { 
    en: 'Scan a QR code using the QR Scanner tab', 
    es: 'Escanea un código QR usando la pestaña Escáner QR',
    pt: 'Escaneie um código QR usando a aba Scanner QR'
  },
  'claim.howToManual': { 
    en: 'Or manually enter a claim code in the Manual Entry tab', 
    es: 'O ingresa manualmente un código de reclamo en la pestaña Entrada Manual',
    pt: 'Ou digite manualmente um código de reivindicação na aba Entrada Manual'
  },
  'claim.oncePerUser': { 
    en: 'Each badge can only be claimed once per user', 
    es: 'Cada insignia solo puede ser reclamada una vez por usuario',
    pt: 'Cada emblema só pode ser reivindicado uma vez por usuário'
  },
  'claim.limitedQuantity': { 
    en: 'Some badges have limited quantities available', 
    es: 'Algunas insignias tienen cantidades limitadas disponibles',
    pt: 'Alguns emblemas têm quantidades limitadas disponíveis'
  },
  
  // Claim Errors
  'error.notAvailable': { 
    en: 'This badge is no longer available. All copies have been claimed.', 
    es: 'Esta insignia ya no está disponible. Todas las copias han sido reclamadas.',
    pt: 'Este emblema não está mais disponível. Todas as cópias foram reivindicadas.'
  },
  'error.alreadyClaimed': { 
    en: 'You have already claimed this badge. Check your "My Badges" tab.', 
    es: 'Ya has reclamado esta insignia anteriormente. Revisa tu pestaña "Mis Insignias".',
    pt: 'Você já reivindicou este emblema. Confira sua aba "Meus Emblemas".'
  },
  'error.invalidCode': { 
    en: 'Invalid claim code. Please verify the code and try again.', 
    es: 'Código de reclamo inválido. Por favor, verifica el código e intenta nuevamente.',
    pt: 'Código de reivindicação inválido. Por favor, verifique o código e tente novamente.'
  },
  'error.connection': { 
    en: 'Connection error. Please reload the page and try again.', 
    es: 'Error de conexión. Por favor, recarga la página e intenta nuevamente.',
    pt: 'Erro de conexão. Por favor, recarregue a página e tente novamente.'
  },
  'error.communityNotFound': { 
    en: 'Community not found. The code may be invalid.', 
    es: 'Comunidad no encontrada. El código puede ser inválido.',
    pt: 'Comunidade não encontrada. O código pode ser inválido.'
  },
  'error.unauthorized': { 
    en: 'Not authorized to perform this action.', 
    es: 'No autorizado para realizar esta acción.',
    pt: 'Não autorizado a realizar esta ação.'
  },
  'error.codeRequired': { 
    en: 'A valid claim code is required.', 
    es: 'Se requiere un código de reclamo válido.',
    pt: 'É necessário um código de reivindicação válido.'
  },
  'error.emptyCode': { 
    en: 'Please enter a valid claim code.', 
    es: 'Por favor, ingresa un código de reclamo válido.',
    pt: 'Por favor, digite um código de reivindicação válido.'
  },
  'error.invalidQR': { 
    en: 'Invalid QR code. Could not extract claim code. Please try scanning again.', 
    es: 'Código QR inválido. No se pudo extraer el código de reclamo. Por favor, intenta escanear nuevamente.',
    pt: 'Código QR inválido. Não foi possível extrair o código de reivindicação. Por favor, tente escanear novamente.'
  },
  'error.generic': { 
    en: 'Error claiming badge:', 
    es: 'Error al reclamar insignia:',
    pt: 'Erro ao reivindicar emblema:'
  },
  
  // QR Scanner
  'scanner.cameraNotSupported': { 
    en: 'Camera is not supported on this device or browser. Please try using a different device or enter the code manually.', 
    es: 'La cámara no es compatible con este dispositivo o navegador. Por favor, intenta usar un dispositivo diferente o ingresa el código manualmente.',
    pt: 'A câmera não é suportada neste dispositivo ou navegador. Por favor, tente usar um dispositivo diferente ou digite o código manualmente.'
  },
  'scanner.preview': { 
    en: 'Camera preview will appear here', 
    es: 'La vista previa de la cámara aparecerá aquí',
    pt: 'A visualização da câmera aparecerá aqui'
  },
  'scanner.permissionDenied': { 
    en: 'Camera permission denied. Please allow camera access in your browser settings and try again.', 
    es: 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador e intenta nuevamente.',
    pt: 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do seu navegador e tente novamente.'
  },
  'scanner.notFound': { 
    en: 'No camera found on this device. Please verify your device has a camera or enter the code manually.', 
    es: 'No se encontró ninguna cámara en este dispositivo. Por favor, verifica que tu dispositivo tenga una cámara o ingresa el código manualmente.',
    pt: 'Nenhuma câmera encontrada neste dispositivo. Por favor, verifique se seu dispositivo tem uma câmera ou digite o código manualmente.'
  },
  'scanner.notSupportedBrowser': { 
    en: 'Camera is not supported on this browser. Please try using a different browser or enter the code manually.', 
    es: 'La cámara no es compatible con este navegador. Por favor, intenta usar un navegador diferente o ingresa el código manualmente.',
    pt: 'A câmera não é suportada neste navegador. Por favor, tente usar um navegador diferente ou digite o código manualmente.'
  },
  'scanner.unknownError': { 
    en: 'Camera error:', 
    es: 'Error de cámara:',
    pt: 'Erro de câmera:'
  },
  'scanner.tryManual': { 
    en: 'Please try again or enter the code manually.', 
    es: 'Por favor, intenta nuevamente o ingresa el código manualmente.',
    pt: 'Por favor, tente novamente ou digite o código manualmente.'
  },
  'scanner.start': { 
    en: 'Start Scanner', 
    es: 'Iniciar Escáner',
    pt: 'Iniciar Scanner'
  },
  'scanner.starting': { 
    en: 'Starting...', 
    es: 'Iniciando...',
    pt: 'Iniciando...'
  },
  'scanner.stop': { 
    en: 'Stop Scanner', 
    es: 'Detener Escáner',
    pt: 'Parar Scanner'
  },
  'scanner.pointCamera': { 
    en: 'Point your camera at a QR code to claim a badge', 
    es: 'Apunta tu cámara a un código QR para reclamar una insignia',
    pt: 'Aponte sua câmera para um código QR para reivindicar um emblema'
  },
  
  // Manage Communities
  'manage.create': { 
    en: 'Create', 
    es: 'Crear',
    pt: 'Criar'
  },
  'manage.communities': { 
    en: 'Communities', 
    es: 'Comunidades',
    pt: 'Comunidades'
  },
  'manage.addBadge': { 
    en: 'Add Badge', 
    es: 'Agregar Insignia',
    pt: 'Adicionar Emblema'
  },
  'manage.qrCodes': { 
    en: 'QR Codes', 
    es: 'Códigos QR',
    pt: 'Códigos QR'
  },
  'manage.analytics': { 
    en: 'Analytics', 
    es: 'Analíticas',
    pt: 'Análises'
  },
  'manage.createCommunity': { 
    en: 'Create a New Community', 
    es: 'Crear una Nueva Comunidad',
    pt: 'Criar uma Nova Comunidade'
  },
  'manage.createCommunityDesc': { 
    en: 'Start your own badge collection community and become its administrator', 
    es: 'Inicia tu propia comunidad de colección de insignias y conviértete en su administrador',
    pt: 'Inicie sua própria comunidade de coleção de emblemas e torne-se seu administrador'
  },
  'manage.communityName': { 
    en: 'Community Name', 
    es: 'Nombre de la Comunidad',
    pt: 'Nome da Comunidade'
  },
  'manage.enterCommunityName': { 
    en: 'Enter community name', 
    es: 'Ingresa el nombre de la comunidad',
    pt: 'Digite o nome da comunidade'
  },
  'manage.creating': { 
    en: 'Creating...', 
    es: 'Creando...',
    pt: 'Criando...'
  },
  'manage.createButton': { 
    en: 'Create Community', 
    es: 'Crear Comunidad',
    pt: 'Criar Comunidade'
  },
  'manage.communityCreated': { 
    en: 'Community created successfully!', 
    es: '¡Comunidad creada exitosamente!',
    pt: 'Comunidade criada com sucesso!'
  },
  'manage.canAddBadges': { 
    en: 'You can now add badges to your community', 
    es: 'Ahora puedes agregar insignias a tu comunidad',
    pt: 'Agora você pode adicionar emblemas à sua comunidade'
  },
  'manage.myCommunities': { 
    en: 'My Communities', 
    es: 'Mis Comunidades',
    pt: 'Minhas Comunidades'
  },
  'manage.myCommunitiesDesc': { 
    en: 'View and manage all communities you have created', 
    es: 'Ver y gestionar todas las comunidades que has creado',
    pt: 'Visualize e gerencie todas as comunidades que você criou'
  },
  'manage.communityId': { 
    en: 'Community ID (for internal use)', 
    es: 'ID de Comunidad (para uso interno)',
    pt: 'ID da Comunidade (para uso interno)'
  },
  'manage.noCommunitiesYet': { 
    en: 'You haven\'t created any communities yet', 
    es: 'Aún no has creado ninguna comunidad',
    pt: 'Você ainda não criou nenhuma comunidade'
  },
  'manage.createFirst': { 
    en: 'Create your first community to get started', 
    es: 'Crea tu primera comunidad para comenzar',
    pt: 'Crie sua primeira comunidade para começar'
  },
  'manage.loadError': { 
    en: 'Failed to load communities. Please try refreshing the page.', 
    es: 'Error al cargar comunidades. Por favor, intenta actualizar la página.',
    pt: 'Falha ao carregar comunidades. Por favor, tente atualizar a página.'
  },
  'manage.addBadgeTitle': { 
    en: 'Add a Badge', 
    es: 'Agregar una Insignia',
    pt: 'Adicionar um Emblema'
  },
  'manage.addBadgeDesc': { 
    en: 'Add a new badge to your community (admin only)', 
    es: 'Agregar una nueva insignia a tu comunidad (solo administrador)',
    pt: 'Adicione um novo emblema à sua comunidade (somente administrador)'
  },
  'manage.selectCommunity': { 
    en: 'Select Community', 
    es: 'Seleccionar Comunidad',
    pt: 'Selecionar Comunidade'
  },
  'manage.chooseCommunity': { 
    en: 'Choose a community', 
    es: 'Elige una comunidad',
    pt: 'Escolha uma comunidade'
  },
  'manage.selectCommunityDesc': { 
    en: 'Select the community where you want to add this badge', 
    es: 'Selecciona la comunidad donde quieres agregar esta insignia',
    pt: 'Selecione a comunidade onde deseja adicionar este emblema'
  },
  'manage.badgeName': { 
    en: 'Badge Name', 
    es: 'Nombre de la Insignia',
    pt: 'Nome do Emblema'
  },
  'manage.enterBadgeName': { 
    en: 'Enter badge name', 
    es: 'Ingresa el nombre de la insignia',
    pt: 'Digite o nome do emblema'
  },
  'manage.description': { 
    en: 'Description', 
    es: 'Descripción',
    pt: 'Descrição'
  },
  'manage.enterDescription': { 
    en: 'Enter badge description', 
    es: 'Ingresa la descripción de la insignia',
    pt: 'Digite a descrição do emblema'
  },
  'manage.badgeImage': { 
    en: 'Badge Image', 
    es: 'Imagen de la Insignia',
    pt: 'Imagem do Emblema'
  },
  'manage.uploadImage': { 
    en: 'Upload Image', 
    es: 'Subir Imagen',
    pt: 'Enviar Imagem'
  },
  'manage.changeImage': { 
    en: 'Change Image', 
    es: 'Cambiar Imagen',
    pt: 'Alterar Imagem'
  },
  'manage.uploadImageDesc': { 
    en: 'Upload an image for your badge (max 5MB)', 
    es: 'Sube una imagen para tu insignia (máx 5MB)',
    pt: 'Envie uma imagem para seu emblema (máx 5MB)'
  },
  'manage.quantity': { 
    en: 'Quantity Available', 
    es: 'Cantidad Disponible',
    pt: 'Quantidade Disponível'
  },
  'manage.enterQuantity': { 
    en: 'Enter quantity (max 200)', 
    es: 'Ingresa la cantidad (máx 200)',
    pt: 'Digite a quantidade (máx 200)'
  },
  'manage.quantityDesc': { 
    en: 'Maximum 200 badges can be created per badge type', 
    es: 'Se pueden crear un máximo de 200 insignias por tipo de insignia',
    pt: 'Máximo de 200 emblemas podem ser criados por tipo de emblema'
  },
  'manage.claimCodeLabel': { 
    en: 'Claim Code', 
    es: 'Código de Reclamo',
    pt: 'Código de Reivindicação'
  },
  'manage.enterClaimCode': { 
    en: 'Enter unique claim code', 
    es: 'Ingresa un código de reclamo único',
    pt: 'Digite um código de reivindicação único'
  },
  'manage.claimCodeDesc': { 
    en: 'This code will be used to claim the badge', 
    es: 'Este código se usará para reclamar la insignia',
    pt: 'Este código será usado para reivindicar o emblema'
  },
  'manage.uploadingImage': { 
    en: 'Uploading image...', 
    es: 'Subiendo imagen...',
    pt: 'Enviando imagem...'
  },
  'manage.addingBadge': { 
    en: 'Adding Badge...', 
    es: 'Agregando Insignia...',
    pt: 'Adicionando Emblema...'
  },
  'manage.addBadgeButton': { 
    en: 'Add Badge', 
    es: 'Agregar Insignia',
    pt: 'Adicionar Emblema'
  },
  'manage.needCommunity': { 
    en: 'You need to create a community first before adding badges. Go to the "Create" tab to get started.', 
    es: 'Necesitas crear una comunidad primero antes de agregar insignias. Ve a la pestaña "Crear" para comenzar.',
    pt: 'Você precisa criar uma comunidade primeiro antes de adicionar emblemas. Vá para a aba "Criar" para começar.'
  },
  'manage.badgeQRCodes': { 
    en: 'Badge QR Codes', 
    es: 'Códigos QR de Insignias',
    pt: 'Códigos QR de Emblemas'
  },
  'manage.qrCodesDesc': { 
    en: 'View and download QR codes for your badges - scan to claim directly', 
    es: 'Ver y descargar códigos QR para tus insignias - escanea para reclamar directamente',
    pt: 'Visualize e baixe códigos QR para seus emblemas - escaneie para reivindicar diretamente'
  },
  'manage.loadingQR': { 
    en: 'Loading QR code generator...', 
    es: 'Cargando generador de códigos QR...',
    pt: 'Carregando gerador de códigos QR...'
  },
  'manage.claimCodeShort': { 
    en: 'Claim code:', 
    es: 'Código de reclamo:',
    pt: 'Código de reivindicação:'
  },
  'manage.downloadQR': { 
    en: 'Download QR Code', 
    es: 'Descargar Código QR',
    pt: 'Baixar Código QR'
  },
  'manage.failedQR': { 
    en: 'Failed to generate QR code', 
    es: 'Error al generar código QR',
    pt: 'Falha ao gerar código QR'
  },
  'manage.noBadgesYet': { 
    en: 'No badges created yet', 
    es: 'Aún no se han creado insignias',
    pt: 'Ainda não foram criados emblemas'
  },
  'manage.createBadgesForQR': { 
    en: 'Create badges to generate QR codes', 
    es: 'Crea insignias para generar códigos QR',
    pt: 'Crie emblemas para gerar códigos QR'
  },
  
  // Badge Analytics
  'analytics.title': { 
    en: 'Badge Analytics', 
    es: 'Analíticas de Insignias',
    pt: 'Análises de Emblemas'
  },
  'analytics.description': { 
    en: 'View detailed statistics and claim information for your badges', 
    es: 'Ver estadísticas detalladas e información de reclamos para tus insignias',
    pt: 'Visualize estatísticas detalhadas e informações de reivindicação para seus emblemas'
  },
  'analytics.totalCreated': { 
    en: 'Total Created', 
    es: 'Total Creadas',
    pt: 'Total Criados'
  },
  'analytics.claimed': { 
    en: 'Claimed', 
    es: 'Reclamadas',
    pt: 'Reivindicados'
  },
  'analytics.remaining': { 
    en: 'Remaining', 
    es: 'Restantes',
    pt: 'Restantes'
  },
  'analytics.usersWho': { 
    en: 'Users who claimed this badge', 
    es: 'Usuarios que reclamaron esta insignia',
    pt: 'Usuários que reivindicaram este emblema'
  },
  'analytics.noClaims': { 
    en: 'No claims yet', 
    es: 'Aún no hay reclamos',
    pt: 'Ainda não há reivindicações'
  },
  'analytics.noBadges': { 
    en: 'No badges created yet', 
    es: 'Aún no se han creado insignias',
    pt: 'Ainda não foram criados emblemas'
  },
  'analytics.createToView': { 
    en: 'Create badges to view analytics and track claims', 
    es: 'Crea insignias para ver analíticas y rastrear reclamos',
    pt: 'Crie emblemas para visualizar análises e acompanhar reivindicações'
  },
  'analytics.loadError': { 
    en: 'Failed to load badge analytics. Please try refreshing the page.', 
    es: 'Error al cargar analíticas de insignias. Por favor, intenta actualizar la página.',
    pt: 'Falha ao carregar análises de emblemas. Por favor, tente atualizar a página.'
  },
  
  // App Statistics
  'stats.title': {
    en: 'App Statistics',
    es: 'Estadísticas de la Aplicación',
    pt: 'Estatísticas do Aplicativo'
  },
  'stats.description': {
    en: 'View platform-wide statistics and insights',
    es: 'Ver estadísticas e información de toda la plataforma',
    pt: 'Visualize estatísticas e insights de toda a plataforma'
  },
  'stats.totalCommunities': {
    en: 'Total Communities',
    es: 'Total de Comunidades',
    pt: 'Total de Comunidades'
  },
  'stats.totalBadgesMinted': {
    en: 'Total Badges Minted',
    es: 'Total de Insignias Creadas',
    pt: 'Total de Emblemas Criados'
  },
  'stats.communitiesCreated': {
    en: 'Communities Created',
    es: 'Comunidades Creadas',
    pt: 'Comunidades Criadas'
  },
  'stats.badgesMinted': {
    en: 'Badges Minted',
    es: 'Insignias Creadas',
    pt: 'Emblemas Criados'
  },
  'stats.platformOverview': {
    en: 'Platform Overview',
    es: 'Resumen de la Plataforma',
    pt: 'Visão Geral da Plataforma'
  },
  'stats.loading': {
    en: 'Loading statistics...',
    es: 'Cargando estadísticas...',
    pt: 'Carregando estatísticas...'
  },
  'stats.loadError': {
    en: 'Failed to load statistics. Please try refreshing the page.',
    es: 'Error al cargar estadísticas. Por favor, intenta actualizar la página.',
    pt: 'Falha ao carregar estatísticas. Por favor, tente atualizar a página.'
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('openspora-language');
    return (stored === 'en' || stored === 'es' || stored === 'pt') ? stored : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('openspora-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
