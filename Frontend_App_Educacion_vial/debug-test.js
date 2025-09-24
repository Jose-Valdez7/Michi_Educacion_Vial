console.log('🔍 DEBUG: Estado actual de pathsRef:', pathsRef.current);
console.log('🔍 DEBUG: Estado actual de COLORS:', COLORS);
console.log('🔍 DEBUG: Estado actual de taskParam:', taskParam);
console.log('🔍 DEBUG: Estado actual de title:', title);

const data = {
  title: title.trim() || 'Dibujo',
  taskId: taskParam,
  paths: pathsRef.current,
  colors: COLORS,
  baseImage: taskParam,
};

console.log('🔍 DEBUG: Datos preparados para enviar:', {
  title: data.title,
  taskId: data.taskId,
  pathsCount: data.paths?.length || 0,
  colorsCount: data.colors?.length || 0,
  baseImage: data.baseImage,
  hasPaths: !!data.paths && data.paths.length > 0,
  hasColors: !!data.colors && data.colors.length > 0,
  hasTitle: !!data.title,
  hasTaskId: !!data.taskId,
  hasBaseImage: !!data.baseImage,
  pathsData: data.paths,
  colorsData: data.colors,
  pathsRefCurrent: pathsRef.current,
  COLORSConstant: COLORS
});
