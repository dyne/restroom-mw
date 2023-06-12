import { Restroom } from "@restroom-mw/core";
import { NextFunction, Request, Response } from "express";
import { ObjectLiteral } from "@restroom-mw/types";
import { Action } from "./actions";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import path from "path";
import fs from "fs";
import { validateSubdir } from "@restroom-mw/utils";

export const FILES_DIR = process.env.FILES_DIR;

// save path must be subdirs of FILES_DIR
const validatePath = validateSubdir(FILES_DIR);

type ZenroomCommit = {
  author: string;
  email: string;
  files: string[];
  message: string;
};

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res, Object.keys(Action));
  let input: ObjectLiteral = null;

  rr.onBefore(async (params: any) => {
    const { zencode, data, keys } = params;
    input = rr.combineDataKeys(data, keys);

    if (zencode.match(Action.CLONE)) {
      const args = zencode.chunkedParamsOf(Action.CLONE, 2);
      for (const [repoUrlName, repoPathName] of args) {
        const repoUrl = input[repoUrlName] || repoUrlName;
        const repoPath = input[repoPathName] || repoPathName;
        const absoluteRepo = path.resolve(path.join(FILES_DIR, repoPath));
        validatePath(absoluteRepo);

        await git.clone({ fs, http, dir: absoluteRepo, url: repoUrl });
      }
    }
    if (zencode.match(Action.VERIFY)) {
      const args = zencode.chunkedParamsOf(Action.VERIFY, 1);
      let errorMsg = null;
      await Promise.all(
        args.map(async ([pathName]: string[]) => {
          const repo = input[pathName] || pathName;
          const absolutePath = path.resolve(path.join(FILES_DIR, repo));
          validatePath(absolutePath);
          return git
            .findRoot({ fs, filepath: absolutePath })
            .catch(() => (errorMsg = repo));
        })
      );

      if (errorMsg != null) {
        throw new Error(`[GIT] ${errorMsg} is not a git repository`);
      }
    }
  });

  rr.onSuccess(async (args: { result: any; zencode: any }) => {
    const { result, zencode } = args;

    if (zencode.match(Action.COMMIT)) {
      const [repoPathName] = zencode.paramsOf(Action.COMMIT);
      const repoPath =
        result[repoPathName] || input[repoPathName] || repoPathName;
      const absoluteRepo = path.resolve(path.join(FILES_DIR, repoPath));
      validatePath(absoluteRepo);
      const commitDict = result.commit || input.commit;
      if (!commitDict) {
        throw new Error(`[GIT] commit details not found`);
      }
      const commit = commitDict as ZenroomCommit;

      await Promise.all(
        commit.files.map((file) => {
          const absoluteFile = path.resolve(path.join(FILES_DIR, file));
          return git.add({
            fs,
            dir: absoluteRepo,
            filepath: path.relative(absoluteRepo, absoluteFile),
          });
        })
      );

      await git.commit({
        fs,
        dir: absoluteRepo,
        message: commit.message,
        author: {
          name: commit.author,
          email: commit.email,
        },
      });
    }
  });

  next();
};
