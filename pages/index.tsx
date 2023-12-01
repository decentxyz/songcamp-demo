import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  Address,
  erc721ABI,
  useAccount,
  useContractRead,
  useWalletClient,
} from "wagmi";
import { TheBox } from "@decent.xyz/the-box";
import {
  ActionType,
  bigintSerializer,
  ChainId,
  EvmAddress,
} from "@decent.xyz/box-common";
import {
  ContractFunctionExecutionError,
  encodePacked,
  Hex,
  keccak256,
  parseEther,
} from "viem";
import { ClientRendered } from "@decent.xyz/box-ui";
import { useState } from "react";
import { songcampAbi } from "../constants/songcampAbi";
import { getPublicClient } from "@wagmi/core";

export const songcampChains = [
  ChainId.ETHEREUM,
  ChainId.ARBITRUM,
  ChainId.BASE,
  ChainId.ZORA,
  ChainId.OPTIMISM,
];

const nftAddress: EvmAddress = "0x3547F3cF6dad2cE64b5c308ebD964822220cF577";
export const useNftBalance = ({
  address,
  token,
  chainId,
}: {
  address: Address;
  token: Address;
  chainId: ChainId;
}) => {
  return useContractRead({
    address: token,
    abi: erc721ABI,
    functionName: "balanceOf",
    args: [address],
    chainId,
    watch: true,
  });
};
const merkleProof = [
  "0xe4c348a91d98afc9be34587b630b53d599fadf00b655aea0dba9d87e39c7ca19",
  "0x9454e9c161bae72807be02a275db91eb8e8d4bb4d8c6b6af8955477bd03f726d",
  "0xc2f06859a23d02845f905e32c172c180a25bda23804a3f61b61dd8e9fa5ea6ac",
  "0x38935e46368c6d84360c3cff51bf788643218112625ed7f1d7a6809cd3f937fa",
  "0xfc92335526bab93be49c02ffa6504b6ee3bee15e48b69f6e0906ee7e3b5160b6",
  "0xf996a9323724d10ceea077c2ffcf1c4d7fb2fd24172539a6d374748fde65be2d",
  "0xdaf3a7b0639d4a2274cf741bdead54179a19a807209d7f74937f01739edc89cb",
  "0x20c957373246d755764c04ed2e6a150395e8d21b552d39666c1dbed9b69822cc",
  "0x86a8000ad0134dd657428e846b4316834a24f81d49d6b133364769c24bfe01b7",
  "0x9e0f22fba4aa912e601b2fe26937f8ed727236413de7a3517a99eaa84bc5efcd",
  "0x010304112c2b08212bc80aff5b9db1969a434012ed5a567492d9d59bb6882cb0",
  "0xbeb3d4bcf7c30b99803d134f26b02ffa09095706edd5982a0decdd7c37809175",
  "0x7f98040718bb79505a892348efc38082a046f2236b852b5e3fdfac371246dd1d",
  "0x3e9435508e548fab3b3e149e20f120a861baf108cf69920f83537e80c5757e42",
  "0xe489723358ffa56413007e56d0a481dfe9b4c00df9abbb4eecb7a90d1b643d4c",
  "0x88a8494edc0ede97ada0e7a8b4d5ef3c7f481461fbae6b4ccf49a9e711e909b9",
  "0x28ea26022aa672e0258dc935b08984f4dd08317f553034169d4ae41ca916210a",
];

const FirstBox = () => {
  const { address } = useAccount();
  const { data: balance } = useNftBalance({
    address: address!,
    token: nftAddress,
    chainId: ChainId.ZORA,
  });

  return (
    <div>
      <div className="flex flex-row ">
        <div className="flex flex-col">
          <h1 className="text-gray-500 text-sm">
            Your NFT Balance: {balance?.toString()}
          </h1>
        </div>
      </div>
      <TheBox
        className="rounded-lg border shadow-md bg-white px-24"
        paymentButtonText="Mint an NFT"
        actionType={ActionType.NftMint}
        chains={songcampChains}
        actionConfig={
          {
            contractAddress: nftAddress,
            chainId: ChainId.ZORA,
            cost: {
              isNative: true,
              amount: 80n,
            },
            signature:
              "function allowListMultiMint(bytes32[] merkleProof, uint256 numberOfTokens, address to) public",
            args: [merkleProof, 1, address],
            deliverEth: true,
          } as any
        }
        apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
      />
    </div>
  );
};

const NftInfo = () => {
  const chainId = ChainId.ZORA;
  console.log({ chainId });
  const [nftId, setNftId] = useState<number>(2);
  const { address } = useAccount();

  const commonArgs = {
    address: nftAddress,
    abi: songcampAbi,
    chainId,
    watch: true,
  };

  const { data } = useContractRead({
    ...commonArgs,
    functionName: "readCdMemory",
    args: [BigInt(nftId)],
  });

  const { data: owner } = useContractRead({
    ...commonArgs,
    functionName: "ownerOf",
    args: [BigInt(nftId)],
  });

  if (!data) {
    return <>loading...</>;
  }
  const [writerAddress, choiceId, written] = data;
  return (
    <div>
      <p>
        {owner == address ? "✅ You own this nft" : "❌ you don't own this nft"}
      </p>
      <input
        className="rounded-lg border shadow-md bg-white px-24"
        type={"number"}
        onChange={(e) => {
          // check for validity and isNan
          const newId = parseInt(e.target.value);
          if (isNaN(newId)) {
            return;
          }
          setNftId(newId);
        }}
        value={nftId}
      />
      <pre>
        {JSON.stringify(
          { writerAddress, choiceId, written },
          bigintSerializer,
          2,
        )}
      </pre>
    </div>
  );
};
const NumberInput = ({ title, value, setValue }: any) => {
  return (
    <div className="flex flex-row ">
      <div className="flex flex-col">
        <label className="text-gray-500 text-sm">{title}</label>
        <input
          className="rounded-lg border shadow-md bg-white px-24"
          type={"number"}
          onChange={(e) => {
            // check for validity and isNan
            const newId = parseInt(e.target.value);
            if (isNaN(newId)) {
              return;
            }
            setValue(newId);
          }}
          value={value}
        />
      </div>
    </div>
  );
};

const SecondBox = () => {
  const [nftId, setNftId] = useState<number>(2);
  const [songChoice, setSongChoice] = useState<number>(3);
  const [signature, setSignature] = useState<Hex>("0x");
  const state = {
    nftId,
    songChoice,
    signature,
  };
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  const tokenIds = [BigInt(nftId)];
  const songSelections = [BigInt(songChoice)];
  return (
    <div>
      <NumberInput title="NFT ID" value={nftId} setValue={setNftId} />
      <NumberInput
        title="Song Choice"
        value={songChoice}
        setValue={setSongChoice}
      />
      <div className="flex flex-row justify-center items-center">
        <div className="flex flex-col">
          <button
            onClick={async () => {
              const hash = keccak256(
                encodePacked(
                  ["uint256[]", "uint256[]"],
                  [tokenIds, songSelections],
                ),
              );

              const _signature = await walletClient?.signMessage({
                account: account.address,
                message: { raw: hash },
              });

              setSignature(_signature!);
            }}
          >
            Sign
          </button>
        </div>
      </div>

      <pre>{JSON.stringify(state, bigintSerializer, 2)} </pre>

      <TheBox
        className="rounded-lg border shadow-md bg-white px-24"
        paymentButtonText="Write to DISC"
        actionType={ActionType.NftMint}
        chains={songcampChains}
        actionConfig={
          {
            contractAddress: nftAddress,
            chainId: ChainId.ZORA,
            signature:
              "function multiWriteToDiscSignature(uint256[] memory tokenIds,uint256[] memory songSelections,bytes memory signature)",
            args: [tokenIds, songSelections, signature as Hex],
            deliverEth: false,
          } as any
        }
        disableGuard={async () => {
          try {
            const publicClient = getPublicClient({
              chainId: ChainId.ZORA,
            });
            await publicClient.simulateContract({
              address: nftAddress,
              abi: songcampAbi,
              functionName: "multiWriteToDiscSignature",
              args: [tokenIds, songSelections, signature as Hex],
            });
            return {
              disable: false,
              message: "",
            };
          } catch (e) {
            if (e instanceof ContractFunctionExecutionError) {
              const err = e as ContractFunctionExecutionError;
              const { metaMessages, message, shortMessage } = err;
              return {
                disable: true,
                message: shortMessage,
              };
            }
            console.error("e", e);
          }
          return {
            disable: true,
            message: "Contract Simulation Failed",
          };
        }}
        apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
      />
    </div>
  );
};

const Home: NextPage = () => {
  const { address } = useAccount();

  return (
    <ClientRendered>
      <div className={styles.container}>
        <main className={styles.main}>
          <ConnectButton />
          <h1 className={styles.title}>Welcome to songcamp demo!</h1>
          <p>your address is: {address}</p>
          <FirstBox />
          <NftInfo />
          <SecondBox />
        </main>

        <footer className={styles.footer}>
          <a
            href="https://rainbow.me"
            rel="noopener noreferrer"
            target="_blank"
          >
            Made with ❤️ by your frens at 🌈
          </a>
        </footer>
      </div>
    </ClientRendered>
  );
};

export default Home;
