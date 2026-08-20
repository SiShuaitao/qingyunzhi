package com.shixingxu.qingyun.service;

import com.shixingxu.qingyun.entity.Character;

import java.util.List;

public interface CharacterService {

    /** 获取所有上线角色，按 sort 升序 */
    List<Character> listOnline();
}
