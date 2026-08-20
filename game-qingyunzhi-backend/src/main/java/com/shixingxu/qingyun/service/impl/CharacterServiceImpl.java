package com.shixingxu.qingyun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shixingxu.qingyun.entity.Character;
import com.shixingxu.qingyun.mapper.CharacterMapper;
import com.shixingxu.qingyun.service.CharacterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CharacterServiceImpl implements CharacterService {

    private final CharacterMapper characterMapper;

    @Override
    public List<Character> listOnline() {
        return characterMapper.selectList(new LambdaQueryWrapper<Character>()
                .eq(Character::getStatus, 1)
                .orderByAsc(Character::getSort)
                .orderByAsc(Character::getId));
    }
}
