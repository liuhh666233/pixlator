{ lib
, mkYarnPackage
, fetchYarnDeps
}:

mkYarnPackage {
  pname = "pixelator-webapp";
  version = "1.0.0";

  src = ../../../webapp;
  packageJSON = ../../../webapp/package.json;

  offlineCache = fetchYarnDeps {
    yarnLock = ../../../webapp/yarn.lock;
    hash = "sha256-drSVW7ANmDiy0Dy970oxkUM+pYU4QasJRC0phD93cOU=";
  };

  buildPhase = ''
    yarn --offline build
  '';

  installPhase = ''
    mkdir $out
    cp -R deps/pixlator-webapp/dist/* $out
  '';

  doDist = false;

  meta = with lib; {
    description = "Pixelator React Frontend UI";
    license = licenses.unfree;
    platforms = platforms.all;
    maintainers = with maintainers; [ breakds ];
  };
}
