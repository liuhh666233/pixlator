{ inputs, ... }:

let self = inputs.self;

in {
  flake.overlays.default = inputs.nixpkgs.lib.composeManyExtensions [
    self.overlays.dev
    (final: prev: {
      pixlator-webapp = prev.callPackage ./pkgs/pixlator/webapp.nix {};
      pythonPackagesExtensions = prev.pythonPackagesExtensions ++ [
        (python-final: python-prev: {
          pixlator = python-final.callPackage ./pkgs/pixlator {};
        })
      ];
    })
  ];

  perSystem = { system, config, pkgs, ... }: {
    _module.args.pkgs = import inputs.nixpkgs {
      inherit system;
      config = {
        allowUnfree = true;
      };
      overlays = [ self.overlays.default ];
    };

    packages.default = pkgs.python3Packages.pixlator;
  };
}
