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
import useSWR from "swr";

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

const FirstBox = () => {
  const { address } = useAccount();
  const { data: balance } = useNftBalance({
    address: address!,
    token: nftAddress,
    chainId: ChainId.ZORA,
  });
  const url = `https://c4-generator.vercel.app/api/generateproof?address=${address}`;
  const { data: merkleProof } = useSWR(address ? url : null, async () => {
    return fetch(url)
      .then((res) => res.json())
      .then((data) => data.proofArray);
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
      {merkleProof && (
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
      )}
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
