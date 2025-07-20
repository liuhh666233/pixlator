{ buildPythonPackage
, makeWrapper
, pytestCheckHook
, pixlator-webapp
, loguru
, click
, fastapi
, uvicorn
, python-multipart
, python-jose
, passlib
, bcrypt
, pydantic
, pillow
, scikit-learn
}:

 buildPythonPackage {
  pname = "pixlator";
  version = "1.0.0";

  srcs = ../../..;

  propagatedBuildInputs = [
    loguru
    click
    fastapi
    uvicorn
    python-multipart
    python-jose
    passlib
    bcrypt
    pydantic
    pillow
    scikit-learn
  ];

  doCheck = false;

  nativeBuildInputs = [ makeWrapper ];

  checkInputs = [ pytestCheckHook ];

  postInstall = ''
    wrapProgram $out/bin/pixlator \
      --set PIXELATOR_FRONTEND ${pixlator-webapp} 
  '';
}
