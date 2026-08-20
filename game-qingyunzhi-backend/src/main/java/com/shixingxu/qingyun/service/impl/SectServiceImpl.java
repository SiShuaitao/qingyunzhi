package com.shixingxu.qingyun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shixingxu.qingyun.entity.Sect;
import com.shixingxu.qingyun.mapper.SectMapper;
import com.shixingxu.qingyun.service.SectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SectServiceImpl implements SectService {

    private final SectMapper sectMapper;

    @Override
    public List<Sect> listOnline() {
        return sectMapper.selectList(new LambdaQueryWrapper<Sect>()
                .eq(Sect::getStatus, 1)
                .orderByAsc(Sect::getSort)
                .orderByAsc(Sect::getId));
    }
}
