// consts de dependências instaladas
const gulp = require('gulp');

// parser do swagger
const SwaggerParser = require('swagger-parser');

// tasks do gulp
gulp.task('lint-rules', () => {
    return SwaggerParser.validate('./routes.yml');
});

gulp.task('lint', gulp.series(
    'lint-routes'
));

gulp.task('default', gulp.series(
    'lint'
));
