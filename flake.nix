{
  description = "A python dev starter package.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    # nix flake lock --override-input nixpkgs "github:NixOS/nixpkgs?rev=b681065d0919f7eb5309a93cea2cfa84dec9aa88"

    flake-utils.url = "github:numtide/flake-utils";

    flake-parts.url = "github:hercules-ci/flake-parts";
    flake-parts.inputs.nixpkgs-lib.follows = "nixpkgs";

  };

  outputs = { self, nixpkgs, flake-parts, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; }{
      systems = [ "x86_64-linux" ];

      imports = [ ./nix/development.nix ];

      perSystem = { system, config, pkgs-dev, ... }: {
        # With this, you can run `nix fmt` to format all nix files in this repo.
        formatter = pkgs-dev.nixfmt-classic;
      };
    };
}