import { Web3Provider } from '@ethersproject/providers';

export function getLibrary(provider) {
  const library = new Web3Provider(provider, "any");
  library.pollingInterval = 15_000;
  return library;
}
