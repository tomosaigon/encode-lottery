import React, { useEffect, useState } from "react";
import { Button } from "baseui/button";
import { Card, StyledAction, StyledBody } from "baseui/card";
import { useAccount, useContractWrite } from "wagmi";
import { usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const RunLottery = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  const Lottery = deployedContracts[scaffoldConfig.targetNetwork.id].Lottery;

  const [betsOpen, setBetsOpen] = useState<boolean>(false);
  const [betsClosingTime, setBetsClosingTime] = useState<bigint>(0n);

  useEffect(() => {
    (async () => {
      const data = await publicClient.readContract({
        address: Lottery.address,
        abi: Lottery.abi,
        functionName: "betsOpen",
      });
      setBetsOpen(data);

      setBetsClosingTime(
        await publicClient.readContract({
          address: Lottery.address,
          abi: Lottery.abi,
          functionName: "betsClosingTime",
        }),
      );
    })();
  }, [Lottery, address, publicClient]);

  const isBeforeClosingTime = new Date().getTime() / 1000 < betsClosingTime;

  const { write: closeLotteryWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "closeLottery",
  });

  return (
    <Card overrides={{ Root: { style: { width: "50%" } } }} title="ROLL!">
      <StyledBody>
        <p className="">{betsOpen ? "Lottery is still open." : "Lottery is already closed."}</p>
        <p className="">{isBeforeClosingTime ? "Too soon to close" : "OK to close"}</p>
      </StyledBody>
      <StyledAction>
        <Button
          disabled={isBeforeClosingTime || !betsOpen}
          overrides={{
            BaseButton: { style: { width: "50%" } },
          }}
          onClick={() => closeLotteryWrite()}
        >
          Run (Close) Lottery
        </Button>
      </StyledAction>
    </Card>
  );
};

export default RunLottery;
