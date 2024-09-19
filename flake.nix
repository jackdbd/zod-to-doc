{
  description = "Inject your Zod schemas into your docs";

  inputs = {
    alejandra = {
      url = "github:kamadorueda/alejandra/3.0.0";
    };
    nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1.*.tar.gz";
  };

  outputs = {
    nixpkgs,
    self,
    ...
  }: let
    supportedSystems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
    forEachSupportedSystem = f:
      nixpkgs.lib.genAttrs supportedSystems (system:
        f {
          pkgs = import nixpkgs {
            inherit system;
            overlays = [self.overlays.default];
          };
        });
  in {
    overlays.default = final: prev: rec {
      nodejs = prev.nodejs;
      yarn = prev.yarn.override {inherit nodejs;};
    };

    devShells = forEachSupportedSystem ({pkgs}: {
      default = pkgs.mkShell {
        packages = with pkgs; [
          neo-cowsay
          nodejs_22
          nodePackages.pnpm
          yarn
        ];
        shellHook = ''
          cowthink "Welcome to this nix dev shell!" --bold -f tux --rainbow
          echo "Versions:"
          echo "- Node.js $(node --version)"
          echo "- npm $(npm --version)"

          # export FOO=bar;
        '';
        # DEBUG = "*";
      };
    });
  };
}
