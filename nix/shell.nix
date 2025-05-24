{ system, nixpkgs }:

let
  pkgs = import nixpkgs { inherit system; };
in
pkgs.mkShell {
  packages = with pkgs; [
    zola
    imagemagickBig
  ];
  shellHook = ''
    echo "You're inside nix dev-shell"
  '';
}
